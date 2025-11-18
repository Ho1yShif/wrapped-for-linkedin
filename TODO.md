# TODO

- Either match engagement numbers to what's visible in the embed, or include a note explaining why the embed and engagement numbers differ (e.g. engagements might have been removed since the static analytics file was generated)
- Display `Total Impressions` under `Top posts` as an int (300K) instead of float (300.0K)
- Move the metrics under `Top posts` into the `Your year at a glance` section
	- Also move tiles (Total impressions, Members Reached, likes/comments/shares) under `Your year at a glance`
	- Make the `Year at a glance` section more prominent and similar to the `Top posts` section
- Remove explicit ordering for top posts section and use the same ordering in the spreadsheet since it's already sorted by engagements
- Unify design so that `Top posts` and `Top demographics` have similar card styles with color outlines on hover not movement
- Bonus: Show mini calendar of follower activity
- UI polish and ensure all metrics are filled in
- Ensure polars join for weird top posts format is optimized
- Optimize Polars parsing speed
- Note that only Excel is supported, not CSV as indicated on the landing page
- Add option: Don't have LinkedIn creator mode?
	- Steps to turn on creator mode
	- View stats for Shifra Williams instead of your own page