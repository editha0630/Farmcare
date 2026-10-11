# Homework 3 (HW3): Init Your Project

This folder is the template for your team's zip file.
Rename the folder from `teamNN_init_project` to your own team number (for example `team14_init_project`), fill in the files under `docs/`, zip the folder, and send it.

| | |
|---|---|
| Consultation | 30 minutes, online, every member attends. Hold it before Friday, October 9. |
| Booking link | https://calendar.app.google/D9QtchwC21Ac8ApE8 |
| Zip file due | At least 12 hours before your slot |
| Send it to | The instructor and both teaching assistants (TAs), in one email. The addresses are in the announcement on KLMS (KAIST Learning Management System). |
| File name | `team14_init_project.zip`, with your own team number |

This differs from the syllabus in two ways.
You send a zip file instead of pushing to a GitHub repository, and the Why Tree comes later in the term, so there is no `WHYTREE.md` in this folder.

## What goes in the zip

```
team14_init_project/
├── README.md               this file; leave it in or take it out
└── docs/
    ├── PROJECT.md          one page: what you think you are building, and for whom
    ├── PREMORTEM.md        merged, sorted list of causes of failure
    ├── QUESTIONS.md        your biggest open questions about this project
    └── premortem/
        ├── yourname.md     one per member: your own causes of failure
        └── ...
```

Keep the paths and the file names as they are.
Later in the term these files move into your team's GitHub repository unchanged, so the paths already match.

## Editing the files

A `.md` (Markdown) file is plain text.
The `#`, `|`, and `-` characters are formatting marks, so leave them where they are and type your answers around them.

- Open the files with a plain-text editor: Notepad on Windows, TextEdit on a Mac.
- Do not use Word or Hangul Word Processor, HWP. They save in their own format and break the file.
- Replace every piece of bracketed text, such as `[YYYY-MM-DD]` or `[names]`, with your real answer, and remove the brackets.
- You do not need to install anything for this homework.

## Do it in this order

The order is the method.
If the team brainstorms risks as a group first, the first risk anyone names anchors everyone else, and the quiet member's risk, which is usually the real one, never gets written down.

1. **Book your slot.** Whole team, today. Slots before October 9 will run out.
2. **Together, about 30 minutes: draft `docs/PROJECT.md`.** Rough is fine. You only need an idea concrete enough that you can imagine it failing in a specific way.
3. **Alone, about 10 minutes each: write `docs/premortem/<yourname>.md`.** Do not read anyone else's list first, and do not ask an artificial intelligence (AI) first either.
4. **Together, 60 to 90 minutes: merge into `docs/PREMORTEM.md`.** Read out, stack the repeats, cluster, pick at most three, and give each countermeasure an owner and a date.
5. **Together, about 20 minutes: write `docs/QUESTIONS.md`.** Go back to `PROJECT.md` and change it if the premortem moved it.
6. **Zip and send**, at least 12 hours before your slot. On a Mac, right-click the team folder and choose Compress. On Windows, right-click it and choose Compress to ZIP file, or Send to, then Compressed (zipped) folder. Attach the `.zip` file, not the folder.
7. **Hold the consultation**, and revise the files within a week.
8. **Alone: write your HW3 reflection on kardens.io**, any time after the zip file is sent. It is due Friday, October 9, 11:59 PM Korea Standard Time (KST).

If your team is spread out over 추석, steps 2, 4, and 5 can be a video call.
They do not have to be in person, and they do not have to happen on the same day.

We cannot check the order of steps 2 to 4 from a zip file.
We are trusting you to follow it, and your team is the one that loses if you skip it.

## Check it yourself before you send

1. The folder and the zip file carry your team number, and the `docs/` layout is unchanged.
2. There is one file per member in `docs/premortem/`, named after that member.
3. Every individual list was written before the team met to merge.
4. Every cause from every individual list appears in the merged list in `docs/PREMORTEM.md`. Repeats are stacked, not dropped.
5. At least two causes in the merged list are about the people in this team, not about the software.
6. You picked at most three causes to act on. Each one has an observable warning signal, a countermeasure with a verb in it, one named owner, and a date.
7. `docs/PROJECT.md` fits on one page, and `docs/QUESTIONS.md` has at most five questions, ranked.
8. No bracketed instruction text is left in any file. Search each file for the `[` character, and make sure everything you find is a real answer.
9. The "Example of a finished row" block in `docs/PREMORTEM.md` is deleted.

If something is missing you can still hold the consultation.
We will then spend the 30 minutes on the missing piece rather than on your project, and that is a bad trade for you.

## Where AI fits

| File | Rule |
|---|---|
| `docs/premortem/<yourname>.md` | Your own list first. AI comes after, not before. |
| `docs/PREMORTEM.md` | The causes come from the team. After the merge, use AI to attack your countermeasures. |
| `docs/PROJECT.md`, `docs/QUESTIONS.md` | AI is fine, as long as your team would defend every sentence. |
| The kardens.io reflection | Your own words. Pasted AI output loses extra credit. |

Write your individual list yourself before you ask any AI.
An AI list anchors you the same way a teammate's list would.
It also does not know who on your team has a product launch at work in November, so the list it gives you is the list every team would get, and that is exactly the list this exercise is designed to get past.

How your team used AI along the way, and what you kept between people, is one of the questions in the kardens.io reflection, so notice it as you go.

After the merge, AI is useful as an attacker.
Paste your three chosen causes and ask it to find the countermeasure that has no verb, or the warning signal nobody could actually observe.

For `PROJECT.md` and `QUESTIONS.md`, use AI however you like, as long as every sentence is one your team would defend in the consultation.

## The reflection on kardens.io

The zip file goes to the instructor and the TAs.
Your own look back at the whole process goes on kardens.io, individually, in the HW3 writing invitation.

It asks four things:

1. What were the key challenges?
2. How did you try to get past them?
3. Did you use AI along the way, and what is your strategy?
4. What did you learn from the premortem?

Write it after your team has sent the zip file.
It is due Friday, October 9, 11:59 PM KST.
Accepting the invitation is not submitting it.

## How the premortem is evaluated

This is the actual rubric.
There is no reason for you to work against a hidden one.

1. **Collective authorship.** Individual lists attributed to specific members, with distinct voices and personal concerns, written before the group merge.
2. **Specific risks.** Risks specific to this team and this product, not risks that would apply to any project in the class.
3. **Real countermeasures.** Specific and actionable, with an owner and a date. Not "we will be careful", and not "we will monitor".
4. **Written by humans.** Perfect structural uniformity across every risk, identical sub-templates, and 1-to-5 scoring matrices are signals of generated text rather than a team argument.

## After the consultation

Revise `PROJECT.md`, `PREMORTEM.md`, and `QUESTIONS.md` to reflect what the consultation changed, and add a row to each revision log naming the consultation date.
The revised files become part of your team's Initial Commit later in the term.

Last term, six of eight teams never touched these files again after first submitting them, including teams that pivoted to a different product and left behind a premortem about a product they no longer built.
The revision is where most of the value is.
The draft is what gets you into the room.
