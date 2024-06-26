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
[x] context file display could be an accordion button

[x] confirm if the lsp only responds with assistant deltas

[x] should context file be an array of files?
[x] disable adding a file after a question has been asked
[x] add a global variable style sheet "theme" in self-hosted

[x] add a context to configuration options like vecdb, and host can be added at the top level (this will change the layout and enable/disable features like darkmode, and vecdb)

[x] hard code @commands for now but it the future they will be fetched
[x] combobox for the @commands
[x] add combobox to chat form and maybe pass text-area as a child component
[x] remove test commands

[x] rag commands come from the caps url.

[X] ensure vscode api is called only once
[x] vscode specific commands and components
[x] export the types for re-use in refact-vscode
[x] vscode attach file
[x] send some info to the chat about the current file open in vscode, probably a REQUEST and RECEIVE file info events
[x] new file button
[x] paste diff button

[ ] check what happens when the lsp isn't on in vscode
[x] in vscode attach shouldn't show if there's no files (like when opening the ide)
[x] canceling chat doesn't seems to work (the spinner keeps spinning) :/
[x] build the events (+ types) as a dedicated file
[ ] automate publishing the main branch
[x] export the chat history component
[x] add vscode specific button for opening the history in a tab
[ ] should be monotype font on tooltip (will require adding a custom tooltip)

[x] command completion combobox interactions
[ ] maybe add optimistic cache for queries to lsp?
[x] remove context latest context files from chat when sending a message
[x] small but in command deletion, type @fi tab delete delete then tab
[x] workspace being run twice ? or adding extra files
[x] update readme with the new features/options
[x] uninstall react-cookie and delete code comments
[x] fix flaky test for multiple commands
[x] figure out why the combobox is sometimes not removing the input trigger
[x] add temp file storage when the user uses @ commands
[x] set the model when using @ commands
[x] prevent the user from changing the model when there are temp files
[x] add new line after command
[x] add flex grow to history list
[x] save last used model
[x] increase textarea height with user input
[x] send whole user input when previewing a command
[x] replace file preview when receiving command preview
[x] don't add a new line if command is executable but has no arguments
[x] use syntax highlighting in the users message
[x] bug when running retry, user message isn't removed
[x] bug with the combobox being open after asking a question
[x] file preview should scroll with textarea
[x] chat content should stay at end when textarea grows
[ ] should the scrolling be disabled if the user has scrolled away from the bottom?

[x] combobox only needs one function for completion and preview
[x] check clicking on the combobox the second click on @@file doesn't seem to work.
[x] place the cursor at the right place when adding a command between text
[x] use repeat to find flaky tests
[x] combobox undo / redo
[x] list display in response has a large margin/padding
[x] tidy up combobox
[x] bug @ast_definition blocks sending requests
[ ] TBD: response cache for undo / redo, use a hashmap
[x] limit the size of undo / redo history
[x] fix re-attaching files on retry
[x] undo redo, holding ctrl keeps the box open until the user releases it
[x] attach file with @ command,
[x] bug: add text, add file go back and edit the text fixed by prepending the command to the value
[x] ctrl-z then enter, cursor is at wrong position
[x] @, enter, enter, ctrl-z, enter
[x] allow paste when no code is selected (A convenient way to insert code from the chat into the active tab (where the cursor is) is needed.)
[x] combobox theme not working in vscode
[x] use a different way to disable attach than if context file is there
[ ] remove snippet
[x] add metering_balance (coins) and model used in chat
[x] figure out why react is being imported in `dist/event/index.d.ts`
[x] prevent react being imported in index.d.ts
[x] redo selected snippet
[x] command controls should only change the text on send

### EVENTS TODO FOR IDEs

[x] add missing events
[x] open new file
[x] diff paste back
[x] open chat in new tab
[x] send chat to side bar
[x] stop streaming button
[x] error handling (done)
[x] back from chat (when in side-bar)
[x] open chat in new tab (side bar only)
[x] send chat to side bar
[x] create lib directory for code that becomes a lib
[x] configure vite to output multiple entry files (one for web and one for the ide's)
[x] export events in package.json or from lib
[ ] remove inline styles?
[x] vscode select text, click new chat the selected code should be in the chat
[ ] add debug? https://www.npmjs.com/package/debug

## FIM

[x] remove old fim code
[x] improve uo for fim
[x] add back button for fim

### dvh and dvw fallback for JetBrains CEF

[x] src/features/Statistic.tsx:39: height: "100dvh",
[x] src/features/FIMDebug.tsx:33: height: "100dvh",
[x] src/features/Chat.tsx:60: height: "100dvh",
[x] src/components/PageWrapper/PageWrapper.module.css:9: height: 100dvh;
[x] src/components/PageWrapper/PageWrapper.module.css:18: height: 100dvh;
[x] src/components/ScrollArea/ScrollArea.module.css:12: height: 100dvh;
[x] src/components/TextArea/TextArea.module.css:5: max-height: 50dvh;
[x] src/components/ChatForm/ChatForm.module.css:23: max-height: 50dvh;
[x] src/components/ChatForm/Form.tsx:15: <ScrollArea scrollbars="vertical" style={{ maxHeight: "50dvh" }}>

[x] src/components/ComboBox/ComboBox.module.css:6: max-width: 50dvw;
[x] src/components/Select/select.module.css:9: max-width: 80dvw;
