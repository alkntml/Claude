import json, subprocess
seg=[(0.0,7.22),(8.70,15.45),(16.68,24.82),(26.13,36.14),(37.36,43.13),(44.28,50.43),(51.65,55.81),(57.12,63.72),(64.92,70.80),(72.25,82.51),(83.92,87.35)]
PAD=0.06; GAP=0.45; LEAD=0.45; K=1/1.03
b=[]; cur=0.35
for a,e in seg:
    b.append(cur); cur += ((e-a)+2*PAD)*K + GAP
total=80.0
S=[0,6,14,23,32.5,39.5,45.5,51.5,59.5,67.5,76,80]
tau=[0]+[bi-LEAD for bi in b[1:]]+[total]
print("starts",[round(x,2) for x in b],"total",total)
print("rates",[round((S[i+1]-S[i])/(tau[i+1]-tau[i]),2) for i in range(11)])
json.dump({"seg":seg,"b":b,"tau":tau,"S":S,"total":total,"PAD":PAD},open("plan.json","w"))
