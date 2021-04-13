import { browser, logging } from 'protractor'

import { AppPage } from './app.po'

describe('Weatherman App', () => {
  let page: AppPage

  beforeEach(() => {
    page = new AppPage()
  })

  it('should display welcome message', async () => {
    await page.navigateTo()
    expect(await page.getTitleText()).toContain('Weatherman  (v1.0.0)')
  })

  afterEach(async () => {
    // Assert that there are no errors emitted from the browser
    const logs = await browser.manage().logs().get(logging.Type.BROWSER)
    expect(logs).not.toContain(
      jasmine.objectContaining({
        level: logging.Level.SEVERE,
      } as logging.Entry)
    )
  })
})
