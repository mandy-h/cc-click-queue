# Overview
This is a Chrome extension to add an adoptable queue for the Click Exchange on clickcritters.com.
# Building this extension
1. Run `npm install` in the project folder.
2. Modify source files inside the `src` folder.
3. Run `npm run build` in the project folder to build the extension. Builds will be outputted in the `dist` folder, with each folder named in this format `[browser]-mv[manifestVersion]`.
# Installation
1. From the latest [release](https://github.com/mandy-h/cc-click-queue/releases/), download the distribution that is compatible with your browser.
    * For Chrome or any other Chromium-based browser, try using `chromium-mv3` first.
    * For Firefox, try using `firefox-mv3` first.
    * If the `mv3` distribution doesn't work or it throws an error when you load the extension in step 4, try `firefox-mv2` instead.
2. Install the extension manually in developer/debugging mode.
    * [Instructions for Chrome](https://developer.chrome.com/docs/extensions/get-started/tutorial/hello-world#load-unpacked) - Make sure to unzip the downloaded folder first.
    * [Instructions for Firefox](https://extensionworkshop.com/documentation/develop/temporary-installation-in-firefox/)
    * If you get an error mentioning manifest, like `Manifest file is missing`, then you probably made a mistake somewhere in the installation steps.
3. Enable the extension if it's not already enabled.
# Usage
1. Add adoptables to the queue. This can be done in two ways -- drag-and-drop or from the browser context menu.
    * Drag-and-drop 
        1. Click on the extension icon to open the pop-up menu.
        2. Click on **Edit Queue**.
        3. Click on **Add Adoptables**.
        4. From a separate window, drag and drop the images of the adoptables you want to add to the queue. Images can be dragged over one at a time, or multiple images can be selected at once by highlighting them.
        ![Selecting multiple images](/../screenshots/readme-img1.png?raw=true)
        5. Enter the target level for these adoptables, and then click **Add to Queue**.
    * Context menu
        1. Right-click on an adoptable or highlighted adoptables.
        2. Click on **Add to queue**.
           
        !["Add to queue" context menu](/../screenshots/readme-img2.png?raw=true)
2. Click on **Start Queue**, either from the extension pop-up or from the queue page.

# Additional notes
* If you **manually change the first adoptable** afterwards by doing any of the following,
   * moving another adoptable to the front of the queue
   * removing the first adoptable in the queue
   * using the "Sort All" menu

  then you need to click on **Start Queue** again. Otherwise, you may end up adding clicking the wrong adoptable in the Click Exchange.
* This extension will not check that the adoptable you have active in the Click Exchange is actually in the queue. It only cares about the level currently displayed in the Click Exchange and the target level of the first adoptable in the queue.
