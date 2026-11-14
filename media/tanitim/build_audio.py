import json, wave, numpy as np
P=json.load(open("plan.json")); K=1/1.03; SR=48000
w=wave.open("vo_fast.wav"); x=np.frombuffer(w.readframes(w.getnframes()),dtype=np.int16).astype(np.float32)/32768
N=int(P["total"]*SR); v=np.zeros(N,np.float32)
for (a,e),bi in zip(P["seg"],P["b"]):
    s=max(0,int((a-P["PAD"])*K*SR)); en=min(len(x),int((e+P["PAD"])*K*SR)); c=x[s:en].copy()
    f=int(0.03*SR); c[:f]*=np.linspace(0,1,f); c[-f:]*=np.linspace(1,0,f)
    p=int(bi*SR); v[p:p+len(c)]+=c[:N-p]
# Müzik: yumuşak pad (C – Am – F – G), her akor 5 sn, 0,8 sn geçiş
t=np.arange(N)/SR
ch=[[130.81,196.00,329.63,493.88],[110.00,164.81,261.63,392.00],[87.31,130.81,220.00,329.63],[98.00,146.83,246.94,293.66]]
L=5.0; m=np.zeros(N,np.float32)
for k in range(int(np.ceil(P["total"]/L))+1):
    st=k*L; notes=ch[k%4]
    env=np.clip((t-st+0.8)/1.6,0,1)*np.clip((st+L+0.8-t)/1.6,0,1); env=np.sin(env*np.pi/2)**2
    idx=env>0
    if not idx.any(): continue
    tt=t[idx]; s=np.zeros(idx.sum(),np.float32)
    for j,f in enumerate(notes):
        a=0.9 if j==0 else 0.55
        for d in (1.0,1.0025,0.9975):
            s+=a*(np.sin(2*np.pi*f*d*tt)+0.18*np.sin(2*np.pi*2*f*d*tt))
    m[idx]+=s*env[idx]
# hafif nabız: yavaş genlik dalgası
m*=0.85+0.15*np.sin(2*np.pi*t/4)
m/=np.abs(m).max()
fi=np.clip(t/2.5,0,1); fo=np.clip((P["total"]-t)/3.0,0,1); m*=fi*fo
# konuşma varken müziği biraz kıs
envv=np.convolve(np.abs(v),np.ones(int(0.25*SR))/(0.25*SR),mode="same"); duck=1-0.45*np.clip(envv/0.03,0,1)
def wr(fn,y):
    y=np.clip(y,-1,1); o=wave.open(fn,"w"); o.setnchannels(1); o.setsampwidth(2); o.setframerate(SR); o.writeframes((y*32767).astype(np.int16).tobytes()); o.close()
wr("voice.wav",v); wr("music.wav",m*duck*0.5)
