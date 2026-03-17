# Google Spreadsheet Database Structure

Please create a Google Spreadsheet and add the following sheets with the exact headers in the FIRST row.

## 1. Sheet: `profile`

Headers:
`name`, `role`, `bio`, `photo`

## 2. Sheet: `projects`

Headers:
`id`, `title`, `description`, `image`, `tech`, `link`, `category`

## 3. Sheet: `skills`

Headers:
`id`, `skill`, `level`

## 4. Sheet: `experience`

Headers:
`id`, `company`, `role`, `year`

## 5. Sheet: `blog`

Headers:
`id`, `title`, `image`, `content`, `category`, `date`

---

### Tips for deployment

1. After creating the sheets and headers, copy the Spreadsheet ID from the URL.
2. The Apps Script is bound to `SpreadsheetApp.getActiveSpreadsheet()`, so it must be created via **Extensions > Apps Script** inside that specific spreadsheet.
3. Deploy as a **Web App**.
4. Set "Access" to **Anyone**.
