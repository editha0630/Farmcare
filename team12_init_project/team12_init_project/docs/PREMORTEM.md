# PREMORTEM.md

Team: 12 / 이동영, 이상준, 정상섭, 홍목연
Members: 이동영, 이상준, 정상섭, 홍목연
Merged on: 2026-09-29
Last updated: 2026-10-01

> **Order matters, and here it is the entire method.**
> Every member first writes their own list in `docs/premortem/<name>.md`, alone.
> Only then does the team fill in this file.
>
> If you brainstorm as a group first, the first risk named anchors everyone else, and the quiet member's risk, which is usually the real one, never gets written down.
>
> Write content in Korean or English.
> Keep the headings exactly as they are.

---

## 1. Individual lists

| Member | File | Written on | Causes listed |
|---|---|---|---|
| 이동영 | `docs/premortem/이동영.md` | 2026-09-29 | 5 |
| 이상준 | `docs/premortem/이상준.md` | 2026-09-29 | 5 |
| 정상섭 | `docs/premortem/정상섭.md` | 2026-09-29 | 5 |
| 홍목연 | `docs/premortem/홍목연.md` | 2026-09-29 | 5 |

## 2. Read-out

Go around the table.
One cause each, in turn, until every list is exhausted.
No debating during the read-out, and nobody reads their whole list at once.
People have to feel safe saying the awkward one, so the only allowed response is writing it down.

## 3. The merged list

Every cause from every list goes here.
Stack the repeats into one row and keep the sharpest wording, not the most diplomatic one.
Cluster by problem, never by role or department: once a cluster is called "development", half the team decides it is somebody else's problem.

Sort by how many members raised it, most first.
The repeats are your priority signal, and you get it for free.
Break ties by expected damage.

Mark a cause with **(us)** when it exists because of who is on this team, not because of the software.
At least two rows must carry that mark: skill asymmetry, time asymmetry, who will actually debug the code the artificial intelligence (AI) wrote, who has a product launch at work in November, who agrees in meetings and then goes quiet.
A premortem with no **(us)** rows is a premortem about software, not about this team.

| # | Failure cause (past tense, specific) | Problem cluster | Raised by | How many |
|---|---|---|---|---|
| 1 | 고령 고객이 디지털 서비스·외부 위탁을 어렵게 느껴 실제 고객 확보에 실패함 | 고객 확보 | 이상준, 정상섭, 홍목연 | 3 |
| 2 | 법·제도적 제약으로 Farmcare 사업모델 자체가 성립하지 않음 | 제도적 규제 | 정상섭, 홍목연 | 2 |
| 3 | 실제 농업 현장과 AI·데이터 기반 예측 결과의 차이로 서비스 신뢰성이 떨어짐 | AI 신뢰도 | 이상준, 정상섭 | 2 |
| 4 | 팀원의 업무·일정으로 프로젝트 기여가 부족해 완성도가 낮아지고, 최종 발표에도 준비 공백이 발생함 **(us)** | 팀 운영 | 이상준, 홍목연 | 2 |
| 5 | 농가의 주요 농작업이 이미 종료되어 실제 현장 검증을 진행하지 못함 | 현장 검증 | 이상준 | 1 |
| 6 | 검증 대상 작물과 농가의 농작업·수확 시기를 사전에 충분히 파악하지 못함 | 현장 검증 | 이상준 | 1 |
| 7 | 농업 현장에 대한 이해 부족으로 실제 농가의 비용과 예상 비용 구조에 큰 차이가 발생함 | 사업모델 | 정상섭 | 1 |
| 8 | 기존 농업 생태계 이해관계자와 충분히 접촉하지 않아 협력 네트워크를 확보하지 못함 | 협력 네트워크 | 정상섭 | 1 |
| 9 | 팀 내부에서는 아이디어를 매력적으로 평가했지만 외부 고객·청중의 관점에서 충분히 검증하지 않아 관심과 공감을 얻지 못함 **(us)** | 팀 편향 | 홍목연 | 1 |
| 10 | 팀원 지인 외에는 실제 타깃 고객 사례를 충분히 확보하지 못해 고객 규모와 타깃의 실재성을 입증하지 못함 | 고객 검증  | 홍목연 | 1 |
| 11 | 실제 농가 테스트에서 서비스 필요성에 대한 긍정적인 반응은 있었지만, 실제 유료 신청으로 이어지는 고객이 거의 없었음 | 고객 검증 | 이동영 | 1 |
| 12 | 실제 거래가 발생했지만 공급자 비용과 운영비를 제외하면 플랫폼에 남는 수익이 거의 없었음 | 수익성 | 이동영 | 1 |
| 13 | 농번기에 특정 지역의 작업 요청이 몰리면서 배정할 공급자가 부족해 일부 주문을 처리하지 못했음 | 공급망 | 이동영 | 1 |
| 14 | 팀원마다 고객과 공급자에 대한 가정이 달라 논의가 반복되었고, 핵심 가설 검증이 늦어졌음 **(us)** | 팀 운영 | 이동영 | 1 |
| 15 | 핵심 고객 가설을 실제로 검증하는 것보다 사업모델을 정리하는 데 시간을 더 사용했음 **(us)** | 시간 운영 | 이동영 | 1 |

## 4. What only one person saw

Look again at every row above that a single member raised.

| Cause | Raised by | What we decided to do about it |
|---|---|---|
| 농가의 주요 농작업이 이미 종료되어 실제 현장 검증을 진행하지 못함 | 이상준 | 검증 대상 농가의 농작업 일정을 사전에 확인하고, 농작업 가능 시기에 맞춰 현장 검증 일정을 확정한다 |
| 검증 대상 작물과 농가의 농작업·수확 시기를 사전에 충분히 파악하지 못함 | 이상준 | 검증 전 대상 작물의 주요 농작업·수확 일정을 파악하고, 검증 가능한 농가를 사전에 선별한다 |
| 농업 현장에 대한 이해 부족으로 실제 농가의 비용과 예상 비용 구조에 큰 차이가 발생함 | 정상섭 | 농가 및 농작업 공급자 인터뷰를 통해 실제 인건비·장비비·자재비 등 비용 구조를 확인한 후 사업성을 산정한다 |
| 기존 농업 생태계 이해관계자와 충분히 접촉하지 않아 협력 네트워크를 확보하지 못함 | 정상섭 | 농작업 인력·농기계·자재 등 주요 공급자를 직접 접촉해 협력 가능 여부와 참여 조건을 확인한다 |
| 팀 내부에서는 아이디어를 매력적으로 평가했지만 외부 고객·청중의 관점에서 충분히 검증하지 않아 관심과 공감을 얻지 못함 **(us)** | 홍목연 | 팀 내부 의견보다 실제 고객 인터뷰와 외부 피드백을 우선해 핵심 가설을 검증하고, 검증 결과에 따라 사업모델을 수정한다 |
| 팀원 지인 외에는 실제 타깃 고객 사례를 충분히 확보하지 못해 고객 규모와 타깃의 실재성을 입증하지 못함 | 홍목연 | 팀원 지인에 의존하지 않고 외부 고령 농가를 추가로 확보해 고객 수요와 타깃의 실재성을 검증한다 |
| 실제 농가 테스트에서 서비스 필요성에 대한 긍정적인 반응은 있었지만, 실제 유료 신청으로 이어지는 고객이 거의 없었음 | 이동영 | 서비스 필요성 확인에 그치지 않고 실제 가격을 제시해 유료 이용 의향 또는 신청까지 확인한다 |
| 실제 거래가 발생했지만 공급자 비용과 운영비를 제외하면 플랫폼에 남는 수익이 거의 없었음 | 이동영 | 거래 단위별 공급자 비용·운영비·매출을 산정해 거래당 수익성을 확인하고, 목표 마진을 충족하지 못하면 가격·수수료 구조를 재검토한다 |
| 농번기에 특정 지역의 작업 요청이 몰리면서 배정할 공급자가 부족해 일부 주문을 처리하지 못했음 | 이동영 | 지역·농번기별 예상 수요와 공급자 현황을 사전에 파악하고, 공급 부족이 예상되는 작업은 사전 확보 또는 서비스 범위를 조정한다 |
| 팀원마다 고객과 공급자에 대한 가정이 달라 논의가 반복되었고, 핵심 가설 검증이 늦어졌음 **(us)** | 이동영 | 고객·수익·공급·운영의 핵심 가설을 우선순위로 합의하고, 각 가설별 검증 방법과 담당자를 명확히 정한다 |
| 핵심 고객 가설을 실제로 검증하는 것보다 사업모델을 정리하는 데 시간을 더 사용했음 **(us)** | 이동영 | 사업모델 완성보다 핵심 고객 가설 검증을 우선하고, 검증 결과에 따라 사업모델을 단계적으로 구체화한다 |

A cause only one person saw is not a weak signal.
It is usually the one the rest of the team is structurally unable to see.

## 5. The three we act on

Pick at most three.
More than three is a list, not a plan.

The top of the merged list is where you start looking, not an automatic answer.
If a cause only one person saw is the one that would end the project, pick it.

| # | Failure cause | Early warning signal — what we would actually observe, and when | Countermeasure — the action | Owner | By when |
|---|---|---|---|---|---|
| 1 | 법·제도적 제약으로 Farmcare 사업모델 자체가 성립하지 않음 | 농지 운영 및 농작업 위탁 방식에 대한 제도·전문가 검토 과정 등에서 현재 사업모델과 충돌하는 법·제도적 제약이 확인됨 | 농지 소유자가 Farmcare 서비스를 통해 농작업 위탁하는 방식이 현행 법·제도상 가능한지 다양한 방식으로 조사(AI 활용, 고객 미팅, 전문가/정부 부처 관계자 인터뷰 등) | 이상준 | 10/16 |
| 2 | 팀원 사례 외에는 실제 타깃 고객 사례를 충분히 확보하지 못해 고객 규모와 타깃의 실재성을 입증하지 못함 | 인터뷰를 통해 시장 및 타깃 고객을 확인했음에도 실제 타깃의 규모와 실재성을 충분히 입증하지 못함 | 2차 자료를 활용한 시장 규모 분석(TAM/SOM 등)을 보완 | 이동영 | 11/7 |
| 3 | 고령 고객이 디지털 서비스·외부 위탁을 어렵게 느껴 실제 고객 확보에 실패함 | 초기 고객 인터뷰 과정에서 고령 농가의 디지털 서비스 이용 부담과 외부에 농작업을 맡기는 것에 대한 심리적 거부감이 반복적으로 확인되고, 인터뷰 대상 중 실제 서비스 참여 의사를 보이는 고객이 충분히 확보되지 않음 | 서비스 이용 절차 단순화, 모바일 앱이나 전산시스템이 아닌 시각화 매뉴얼 제작, AI 기능을 선택적으로 구성하여 진입장벽 제거, 초기 고객 만족도 조사 및 신규 고객에게 내용 공유 통해 심리적 불안감 완화 | 정상섭 | 11/7 |

Three tests every row must pass:

- **The signal is observable.** "We notice we are falling behind" is not a signal. "Two members have not opened the project in seven days" is.
- **The countermeasure is an action, not a posture.** "열심히 하기", "우선순위 관리", and "we will be careful" are intentions. "Call three potential users and write down what they say" is an action. If it has no verb, rewrite it.
- **The owner is one named person, and there is a date.** "The team" owns nothing. A countermeasure with no date is a countermeasure with no week: it never lands on anyone's calendar.

You do not need a 1-to-5 likelihood and impact matrix, and we would rather you did not add one.
It makes every risk look equally considered whether or not it was.

Everything in section 3 that is not in this table is a risk you are knowingly leaving alone for now.
That is a decision, and it is fine.

---

## Revision log

Any change of direction needs a new row here within one week.
A premortem that analyzes a product you no longer build is worse than none, because it reads as covered.

| Date | What changed and why |
|---|---|
| 2026-09-29 | Draft for consultation |
| [YYYY-MM-DD] | Revised after consultation on [date]: [what changed] |

---

Method note: Gary Klein, "Performing a Project Premortem", Harvard Business Review, September 2007.
