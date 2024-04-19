// chrome.runtime.onInstalled.addListener(() => {
//   chrome.action.setBadgeText({
//     text: "OFF",
//   });
// });

// const extensions = 'https://developer.chrome.com/docs/extensions'
// const webstore = 'https://developer.chrome.com/docs/webstore'

// chrome.action.onClicked.addListener(async (tab) => {
//   console.log(tab.url)
//   // if (tab.url.startsWith(extensions) || tab.url.startsWith(webstore)) {
//     // Retrieve the action badge to check if the extension is 'ON' or 'OFF'
//     // const prevState = await chrome.action.getBadgeText({ tabId: tab.id });
//     // // Next state will always be the opposite
//     // const nextState = prevState === 'ON' ? 'OFF' : 'ON'

//     // // Set the action badge to the next state
//     // await chrome.action.setBadgeText({
//     //   tabId: tab.id,
//     //   text: nextState,
//     // });

//     // if (nextState === "ON") {
//     //   // Insert the CSS file when the user turns the extension on
//     //   await chrome.scripting.insertCSS({
//     //     files: ["focus-mode.css"],
//     //     target: { tabId: tab.id },
//     //   });
//     // } else if (nextState === "OFF") {
//     //   // Remove the CSS file when the user turns the extension off
//     //   await chrome.scripting.removeCSS({
//     //     files: ["focus-mode.css"],
//     //     target: { tabId: tab.id },
//     //   });
//     // }
//   // }

//   // 点击icon时，对当前tab进行截图操作
//   chrome.tabs.captureVisibleTab(null, {format: 'png'}, function(dataUrl) {
//     console.log(dataUrl)
//     console.log()
//     // 截图完成后，将图片保存到本地
//     const img = document.createElement('img');
//     img.src = dataUrl;
//     document.body.appendChild(img);
//   });
// });

// 收到内容脚本发送的消息
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  console.log(request)
  if (request.type === 'selectedArea') {
    chrome.tabs.captureVisibleTab(null, { format: 'png' }, function (dataUrl) {
      console.log(dataUrl)
      // 查询所有窗口中当前激活的tab
      chrome.tabs.query({ active: true, currentWindow: true }, function (tabs) {
        // 通过tabs[0].id获取当前tab的id
        // 在当前tab中执行insertImage函数，并传递dataUrl参数
        chrome.scripting.executeScript({
          target: { tabId: tabs[0].id },
          func: insertImage,
          args: [dataUrl, request.data]
        });
        chrome.scripting.executeScript({
          target: { tabId: tabs[0].id },
          func: removeMask
        })
      });
    });
  }
});

function insertImage(dataUrl, rect) {
  const dpr = window.devicePixelRatio || 1; // 获取设备像素比
  const { width, height, top, left } = rect;
  console.log(width, height, top, left);
  
  // 调整尺寸和位置根据设备像素比
  const scaledWidth = width * dpr;
  const scaledHeight = height * dpr;
  const scaledTop = top * dpr;
  const scaledLeft = left * dpr;

  // 将dataUrl转换为图片对象，然后将图片绘制到canvas中
  const img = new Image();
  img.src = dataUrl;
  img.onload = function () {
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    canvas.width = scaledWidth; // 使用调整后的宽度
    canvas.height = scaledHeight; // 使用调整后的高度
    // 使用调整后的尺寸和位置进行绘制
    ctx.drawImage(img, scaledLeft, scaledTop, scaledWidth, scaledHeight, 0, 0, scaledWidth, scaledHeight);
    
    // 将canvas转换为dataUrl
    const newUrl = canvas.toDataURL('image/png');
    
    // 创建一个新的img标签，将dataUrl赋值给src
    const imgElement = document.createElement('img');
    imgElement.src = newUrl;
    imgElement.style.position = 'fixed';
    imgElement.style.top = '0';
    imgElement.style.left = '0';
    imgElement.style.zIndex = '999999999';
    imgElement.style.width = width;
    imgElement.style.height = height;
    document.body.appendChild(imgElement);
  }
}

function removeMask() {
  const mask = document.getElementById('mask');
  mask && mask.remove();
}

