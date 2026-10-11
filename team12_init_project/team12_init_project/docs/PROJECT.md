# PROJECT.md

Team: 12  
Members: 이동영, 이상준, 정상섭, 홍목연 
Last updated: 2026-09-29

One page.  
Draft it together before anyone writes a premortem, and come back to it after the merge.

You are not committing to this.  
You are making it concrete enough to argue about, and concrete enough that a premortem about it means something.  
A project idea you cannot imagine failing in a specific way is not yet an idea.

Later in the term you will run a Why Tree on this, and the Why Tree may well move it.  
That is expected, and it is not wasted work.

Write in Korean or English.  
Keep the headings exactly as they are.

---

## What we think we are building

**Farmcare**는 고령화와 농촌 인력 부족으로 인해 직접 농사를 계속 짓기 어려운 농가를 대신해, 농작업 계획부터 인력·장비·자재 조달, 경작 관리, 수확과 판매까지 농장 운영 전반을 지원하는 농업 운영 컨시어지 서비스이다.  
장기적으로는 농지·기후·작황 데이터를 활용해 필요한 자원과 예상 비용·수익을 산출하고, 정부 지원사업 및 판매처까지 연결해 농가의 운영 부담을 줄이면서 지속 가능한 수익을 만들 수 있는 구조를 목표로 한다.

## Who it is for

- **Person:** 고령으로 인해 직접 농사를 지속하기 어려워지고 있지만 토지와 농업을 포기하고 싶지는 않은 농업인, 그리고 부모의 농업을 직접 승계하기 어려운 도시 거주 자녀
- **Situation:** 파종, 농약 살포, 제초, 수확처럼 특정 시기에 많은 인력과 장비가 필요한 순간이 오거나, 부모가 더 이상 직접 농사를 관리하기 어려워져 농지를 계속 유지할 방법을 고민해야 하는 상황
- **What they do today instead:** 가족이나 주변 지인에게 도움을 요청하거나, 지역 농작업 대행업체·농협·인력사무소 등을 통해 필요한 작업별로 인력과 장비를 따로 확보하고, 농자재 구매·정부 지원사업 신청·수확 후 판매도 각각 개별적으로 해결한다.

## How we know this problem is real

현재까지 이 문제를 검증하기 위한 본격적인 고객 인터뷰는 아직 진행하지 않았다.  
따라서 초기 단계에서는 실제 농사를 짓고 있는 고령 농업인, 농업을 승계하지 않은 자녀, 지역 농협 및 농작업 대행업체 관계자, 농업기술센터 등과 대화해 다음을 확인하려고 한다.

- 고령 농가가 실제로 가장 큰 부담을 느끼는 농작업이 무엇인지
- 현재 해당 작업을 누구에게 맡기고 얼마나 비용을 지불하는지
- 농장 전체 운영을 대신 관리해주는 서비스에 비용을 지불할 의사가 있는지
- 현재의 농작업 대행·인력조달 방식만으로 문제가 충분히 해결되고 있는지

## Why us

우리 팀은 이 문제를 단순한 농업 기술의 문제가 아니라 **운영, 자원 배분, 데이터 분석, 서비스 설계의 문제**로 보고 있다.  
Farmcare의 핵심은 직접 농사를 짓는 기술 그 자체보다 여러 농가의 수요를 통합하고, 필요한 인력·장비·자재를 계획하며, 비용과 예상 수익을 계산하고, 이를 실제 운영과 판매까지 연결하는 데 있다.

우리 팀은 이러한 운영 최적화와 데이터 기반 의사결정 관점에서 서비스를 설계하고, 실제 농가 및 농업 현장 전문가와의 인터뷰를 통해 부족한 농업 전문성을 보완하면서 기존 농작업 대행 서비스와 다른 통합형 운영 모델이 가능한지를 검증하고자 한다.

## What would make us drop this idea

초기 검증에서 인터뷰한 고령 농가와 자녀 세대 중 **5명 가운데 3명 이상이 “농장 운영 전체를 제3자에게 맡길 필요를 느끼지 않거나, 해당 서비스에 비용을 지불할 의사가 없다”고 답한다면**, 현재 형태의 Farmcare 아이디어를 중단하거나 핵심 고객과 서비스 범위를 크게 수정한다.

The thing you are least sure about does not go here.  
It goes at the top of `docs/QUESTIONS.md`, because it is the best use of the 30 minutes.

---

## Revision log

| Date | What changed and why |
|---|---|
| 2026-09-29 | Draft for consultation |
| [YYYY-MM-DD] | Revised after consultation on [date]: [what changed] |
