import { test, expect, Page } from '@playwright/test';

// Helper to ensure palette is expanded and element is visible
async function ensurePaletteVisible(page: Page, elementSelector: string) {
  // Check if palette is minimized
  const paletteMinimized = page.locator('.component-palette.minimized');
  if (await paletteMinimized.isVisible().catch(() => false)) {
    const toggleBtn = page.locator('.palette-toggle-btn');
    await toggleBtn.click();
    await page.waitForTimeout(300);
  }

  // Scroll to element
  const element = page.locator(elementSelector).first();
  await element.waitFor({ state: 'attached', timeout: 5000 });
  await element.scrollIntoViewIfNeeded();
  await element.waitFor({ state: 'visible', timeout: 5000 });
}

// Helper to drag to a drop zone
async function dragToDropZone(page: Page, sourceSelector: string, dropZoneSelector: string) {
  await ensurePaletteVisible(page, sourceSelector);

  const source = page.locator(sourceSelector).first();
  const sourceBox = await source.boundingBox();

  if (!sourceBox) throw new Error(`Could not find source: ${sourceSelector}`);

  // Start drag
  await page.mouse.move(sourceBox.x + sourceBox.width / 2, sourceBox.y + sourceBox.height / 2);
  await page.mouse.down();
  await page.waitForTimeout(50);

  // Move to trigger drag (dnd-kit has distance threshold)
  for (let i = 1; i <= 5; i++) {
    await page.mouse.move(
      sourceBox.x + sourceBox.width / 2 + i * 20,
      sourceBox.y + sourceBox.height / 2
    );
    await page.waitForTimeout(30);
  }

  // Now find the drop zone and move to it
  const dropZone = page.locator(dropZoneSelector).first();
  const dropZoneBox = await dropZone.boundingBox();

  if (dropZoneBox) {
    await page.mouse.move(
      dropZoneBox.x + dropZoneBox.width / 2,
      dropZoneBox.y + dropZoneBox.height / 2,
      { steps: 5 }
    );
  }
  await page.waitForTimeout(100);

  // Drop
  await page.mouse.up();
  await page.waitForTimeout(300);
}

// Helper to drag to canvas center
async function dragToCanvas(page: Page, sourceSelector: string) {
  await ensurePaletteVisible(page, sourceSelector);

  const source = page.locator(sourceSelector).first();
  const sourceBox = await source.boundingBox();

  const canvas = page.locator('.canvas-empty, .form-canvas').first();
  const canvasBox = await canvas.boundingBox();

  if (!sourceBox || !canvasBox) throw new Error('Could not find elements');

  await page.mouse.move(sourceBox.x + sourceBox.width / 2, sourceBox.y + sourceBox.height / 2);
  await page.mouse.down();
  await page.waitForTimeout(50);

  await page.mouse.move(canvasBox.x + canvasBox.width / 2, canvasBox.y + canvasBox.height / 2, { steps: 10 });
  await page.waitForTimeout(100);

  await page.mouse.up();
  await page.waitForTimeout(300);
}

test.describe('Smart Drop Zones', () => {
  test.beforeEach(async ({ page }) => {

    await page.addInitScript(() => {
      localStorage.clear();
    });

    await page.goto('/');
    await page.waitForTimeout(1000);
    await expect(page.locator('.form-canvas')).toBeVisible();

    // Make sure Forms tab is active
    const formsTab = page.locator('button:has-text("Forms"), .tab-button:has-text("Forms")').first();
    if (await formsTab.isVisible().catch(() => false)) {
      await formsTab.click();
      await page.waitForTimeout(300);
    }

    // Create new form
    const addBtn = page.locator('.forms-add-btn').first();
    if (await addBtn.isVisible().catch(() => false)) {
      await addBtn.click();
      await page.waitForTimeout(500);
      const confirmBtn = page.locator('.modal-btn.primary, button:has-text("OK")').first();
      if (await confirmBtn.isVisible({ timeout: 2000 }).catch(() => false)) {
        await confirmBtn.click();
        await page.waitForTimeout(500);
      }
    }
  });

  test('should create Row when dropping to the right of a component', async ({ page }) => {
    // Add Picture to canvas
    await dragToCanvas(page, '[data-testid="palette-picture"]');

    // Verify Picture was added
    const pictureComponent = page.locator('.canvas-component').first();
    await expect(pictureComponent).toBeVisible({ timeout: 5000 });

    // Drag Text Input to the right drop zone
    await dragToDropZone(page, '[data-testid="palette-input"]', '.smart-drop-zone-right');

    // Verify Row was created
    const rowDropZone = page.locator('.row-drop-zone');
    await expect(rowDropZone).toBeVisible({ timeout: 5000 });

    const rowChildren = page.locator('.row-child-component');
    await expect(rowChildren).toHaveCount(2);

    console.log('✅ Row created with 2 children');
  });

  test('should add to existing Row when dropping next to item in Row', async ({ page }) => {
    // Step 1: Add Picture
    await dragToCanvas(page, '[data-testid="palette-picture"]');
    await expect(page.locator('.canvas-component')).toBeVisible({ timeout: 5000 });

    // Step 2: Add Text Input to right (creates Row)
    await dragToDropZone(page, '[data-testid="palette-input"]', '.smart-drop-zone-right');
    await expect(page.locator('.row-drop-zone')).toBeVisible();
    await expect(page.locator('.row-child-component')).toHaveCount(2);

    // Step 3: Add another Input to the right of existing Input in Row
    await dragToDropZone(page, '[data-testid="palette-input"]', '.row-child-component:last-child .smart-drop-zone-right');

    // Verify Row now has 3 children
    await expect(page.locator('.row-child-component')).toHaveCount(3);

    console.log('✅ Added to existing Row, now has 3 children');
  });

  test('should add sibling below when dropping below a component', async ({ page }) => {
    // Add Picture
    await dragToCanvas(page, '[data-testid="palette-picture"]');
    await expect(page.locator('.canvas-component')).toBeVisible({ timeout: 5000 });

    // Drag Text Input to bottom drop zone
    await dragToDropZone(page, '[data-testid="palette-input"]', '.smart-drop-zone-bottom');

    // Verify we have 2 separate top-level components
    const components = page.locator('.canvas-component');
    await expect(components).toHaveCount(2);

    console.log('✅ Added sibling below, now have 2 components');
  });

  test('should build target layout: Picture + vertical fields', async ({ page }) => {
    // Target: Picture | Container with rows of fields

    // Step 1: Add Picture
    await dragToCanvas(page, '[data-testid="palette-picture"]');
    await expect(page.locator('.canvas-component')).toBeVisible({ timeout: 5000 });

    // Step 2: Add Container to the right
    await dragToDropZone(page, '[data-testid="palette-container"]', '.smart-drop-zone-right');
    await expect(page.locator('.row-drop-zone')).toBeVisible();
    await expect(page.locator('.row-child-component')).toHaveCount(2);

    // Step 3: Add Input inside Container
    const containerDropZone = page.locator('.container-drop-zone').first();
    await expect(containerDropZone).toBeVisible();

    await dragToDropZone(page, '[data-testid="palette-input"]', '.container-drop-zone');
    await expect(page.locator('.container-child-component')).toHaveCount(1);

    // Wait for dnd-kit to register new drop zones
    await page.waitForTimeout(500);

    // Step 4: Add Date to right of Input (creates nested Row)
    await dragToDropZone(page, '[data-testid="palette-date"]', '.container-child-component .smart-drop-zone-right');

    // Verify nested row structure
    const nestedRowChildren = page.locator('.container-drop-zone .row-child-component');
    await expect(nestedRowChildren).toHaveCount(2);

    // Step 5: Add another Date
    await dragToDropZone(page, '[data-testid="palette-date"]', '.container-drop-zone .row-child-component:last-child .smart-drop-zone-right');
    await expect(nestedRowChildren).toHaveCount(3);

    // Step 6: Add second row below
    await dragToDropZone(page, '[data-testid="palette-input"]', '.container-drop-zone .row-drop-zone .smart-drop-zone-bottom');

    await page.screenshot({ path: 'test-results/complex-layout.png' });

    console.log('✅ Complex layout built successfully!');
  });
});
