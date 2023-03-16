The current implement is not elegant, but it works. I will try to improve it later.

You should firstly know how current query works. 
- In the visual query editor, you select the column, condition, group by, etc.
- Everytime you the query editor changes, the query will be updated, then a new query text will be generated.
- This plugin sends the new query text to GreptimeDB, and get the result back.

To support time filter, I will insert an extra `where` condition to the query text, called `$timeFilter`. Then this plugin will repleace it with the time range given by Grafana.
