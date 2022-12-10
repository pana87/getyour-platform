const { parseHtml } = require("../features/js/helper.js")
const {expect, test} = require("@jest/globals")

describe('_parseHtml', () => {
  test('should return html string', () => {
    const pathname = "/felix/shs/technician/checklist-item/"

    const html = parseHtml(pathname)
    console.log(html);
    // console.log(html);
    expect(html).toBeDefined()

  })
})
