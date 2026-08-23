import json, statistics as st
D=json.load(open("dados.json"))
S=dict(km=12000,ipva=0.04,comb=6.20,H=5,mmult=1.0)
def multIdade(a):
    for lim,m in D["multIdade"]:
        if a<=lim: return m
    return 3.8
def rel(f,i):
    R=f["retencao"]
    return R[str(int(i))] if i<=14 else R["14"]*(1-f["tcauda"])**(i-14)
def tco(f,ano,H=None,km=None,mmult=None):
    H=H or S["H"]; km=km or S["km"]; mmult=mmult if mmult is not None else S["mmult"]
    p=f["serie"].get(str(ano))
    if not p: return None
    P=p["m"]; idade=max(0,D["anoRef"]-ano)
    r0=rel(f,idade); rev=P*(rel(f,idade+H)/r0); dep=(P-rev)/H
    soma=mn=0; kmf=(km/12000)**0.7; msg=D["multSeg"].get(f["segmento"],1)
    for k in range(H):
        a=idade+k; soma+=P*(rel(f,a)/r0)
        b=f["manutBase"]*multIdade(a)*msg*kmf*mmult
        if a<f["garantiaAnos"]: b*=0.55
        mn+=b
    vm=soma/H
    return dict(fam=f["nome"],ano=ano,idade=idade,preco=P,dep=dep,man=mn/H,
        ipva=vm*S["ipva"],seguro=vm*f["seguroPct"],comb=(km/f["kml"])*S["comb"],
        total=dep+vm*S["ipva"]+vm*f["seguroPct"]+mn/H+(km/f["kml"])*S["comb"],
        gar=max(0,f["garantiaAnos"]*12-idade*12),seg_=f["segmento"])
def pool(lo=50000,hi=120000,**kw):
    out=[]
    for f in D["familias"]:
        for a in f["serie"]:
            if int(a)>D["anoRef"]: continue
            c=tco(f,int(a),**kw)
            if c and lo<=c["preco"]<=hi: out.append(c)
    return out
