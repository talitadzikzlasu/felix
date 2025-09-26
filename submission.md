# Notes on Late-Rent Solution

## Interview notes

### **Time spent**:

- 5 min PR problem solution
- 5 min depnndencies prolem solution
- 30 min start app, run tests, understand the task, get familiar with codebase, read libraries documentation
- 40 min understand the solution proposed in PR, test imprvements ideas
- 35 min review PR, write comments

Additional:

- 30 min consider alternative solutions, write proposed solutions notes
- 60 min implement and test chosen solution, write notes
- 15 min review notes

### **Feedback notes**

- creating new PR through `template` didn't copy the branches history -> creating PR in github was not possible. I cloned the repo and pushed it to newly created repo in my github account. Maybe this could be included in the instruction for future candidates instead of 'create from template'

### **Interview assumptions**

In the middle of leaving comments on PR, I realised it is important for me to know what is the level of experience of the PR author. I assumed here that the author is mid/senior level. THis way I was not explaing too much, just suggesting solutions, ways the PR can be fixes. For junior level programmers I would leave more explanations and probably use slightly more straightforward tone.

## Solution notes

### **General suggestions**

- apollo-server@2.14.4 is outdated, should be upgraded

### Context notes from task description

- managers track late rent in spreadsheets.
- they want to be able easily mark or unmark 'late payers'
- it should be possible to easily see the list of tenants who are late with rent
- this solution should prioritize manual marking, automation may be optional later

### **Assumptions**

- it is useful for manager to know for which month tenant is late with rent
- no overlapping leases
- the tenants views are not split by the building

### **Questions to client**

- would it be useful to keep late rent flags history?
- can tenant be late with lease that has ended?

### Notes to the solution proposed in PR

This solution is simple, easy to implement and can be a quick way to satisfy manager's needs and have that functionality quickly in production.

But over time it can create some problems:

- _no period context_ - the flag isnt tied to a month. Unflagging "last month" also clears "this month".

- _no history_ - we can't say whether tenant was late last month or when the flag changed

- _can't mark multiple months_ - one boolean can't represent September and October rent being late

- multiple leases problem - if tenant has one lease finished and started a new one, a single flag can't say which lease is late, changing flag for one lease, changes it for all leases

- _easy monthly view problem_ - manage can't list tenant late with rent in previous month

- it is hard to audit mistakes - when was the flag set or changed?

- may differ from data saved in lease and payments tables

### Alternative options considered

#### A) **Flag per tenant+period** _(Implemented in alternative solution PR)_

- Add a table keyed by `(tenantId, period)`.
- Pros: matches request exactly; easy to keep/check history of changes; scalable; doesn't interfere with current tables;
- Cons: manual effort; may differ from data saved in lease and payments tables;

#### B) **Manual Flag per tenant+period. Additionally `system late` info computed from leases+payments**

- possible, but needs clear rules (due day, grace period, which payment is for which lease/rent).
- with current Payment model and saved payments data, results can be surprising

#### C) Invoices

Create table with invoices for lease for each month.

- mirrors real-world invoicing: tenants receive monthly invoices; can be easily automated; scalable; gives more automation possibilities - sending automatic invoice reminder, keeping ivoice data in one place,
- bigger, more complicated project, takes time to implement and test
- needs setup for monthly generation of invoices

## Needed TODO next/didn't include in my PR:

- add tests

## Optional what can be done next:

- add **flaggedBy** info
- add **notes** or **reason** field to keep more data about flagging
- rethink keeping flags history - never deleting the flag but adding new
- think about possibility of **automation** -> checking if user is late with rent based on lease and payments data. This would need more information on how paymnts are handled and saved and possibly some additional data saved in payments (for which period payment is made)
