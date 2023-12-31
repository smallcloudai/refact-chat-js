# TODOs

[-] login
[ ] use lsp handlers for chat (keys and config)
[-] no need for logins it's passed when the lsp starts

[x] check cors issues with lsp
[ ] clean events

[?] How should it handle going offline?

### for http release

[?] get config (lsp url)
[x] generic text area
[x] fix scroll area
[x] get caps (models)
[x] handle errors
[x] disable inputs while streaming
[x] remove item from history
[x] code block scroll area (wrap for now)
[ ] type `postMessage` and `dispatch` calls

[?] user markdown input?
[x] enable dark mode

[ ] use grid layout for chat and sidebar?

### PRIORITY

[?] set lsp url
[x] model selection
[x] no api key
[x] Test cases (selecting model, errors, messages)
[x] remove item from history
[x] disable inputs while streaming
[x] stop stream button
[x] build the app (also think about how it'll be configured)
[x] content for when chat is empty
[x] fix the text area placement (empty chat content might help with this)
[x] make it look nice
[x] handle being offline
[x] handle long requests

[x] scroll lags a bit
[x] attach file (this will be different between docker and IDE's)
[x] use the event bus to handle the file upload in the browser this can be done with the file system api using `window.showOpenFilePicker()`
[x] should we allow multiple context files?
[ ] context file display could be an accordion button

[-] confirm if the lsp only responds with assistant deltas

[x] should context file be an array of files?
[x] disable adding a file after a question has been asked
[ ] custom build for self hosted as it doesn't need dark-mode or an interactive theme
[ ] add a global variable style sheet "theme" in self-hosted

### TBD

[ ] build an asset for docker (saves installing node on ubunto through nvm)
[ ] automate adding the chat to docker
[ ] in the self hosted docker image it seems that it maybe be posable to use the chat as a plugin or web-component, of function

### EVENTS TODO FOR IDEs

[ ] add missing events
[ ] open new file
[ ] diff paste back
[ ] open chat in new tab
[ ] send chat to side bar
[x] stop streaming button
[x] error handling (done)
[ ] back from chat (when in side-bar)
[ ] open chat in new tab (side bar only)
[ ] send chat to side bar
