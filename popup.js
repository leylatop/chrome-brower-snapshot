document.addEventListener('DOMContentLoaded', function () {
  const screenshotButton = document.getElementById('screenshotButton');
  // 点击popup.html中的按钮时，触发事件
  screenshotButton.addEventListener('click', async () => {
    // 向background.js发送消息
    chrome.runtime.sendMessage({});
    chrome.tabs.query({ active: true, currentWindow: true }, function (tabs) {
      chrome.scripting.executeScript({
        target: { tabId: tabs[0].id },
        func: addMask
      });

      // 监听鼠标事件
      chrome.scripting.executeScript({
        target: { tabId: tabs[0].id },
        func: mouseEventListener
      });
    });
  });
});

function addMask() {
  if(document.getElementById('mask')) return
  const mask = document.createElement('div');
  mask.id = 'mask';
  mask.style.position = 'fixed';
  mask.style.top = '0';
  mask.style.left = '0';
  mask.style.width = '100%';
  mask.style.height = '100%';
  mask.style.backgroundColor = 'rgba(0, 0, 0, 0.5)';
  mask.style.zIndex = '9999';
  document.body.appendChild(mask);
}

function mouseEventListener() {
  // 监听鼠标点击事件
  document.addEventListener("mousedown", (e) => {

    clearSelectedArea()
    const startPoint = {
      x: e.clientX,
      y: e.clientY
    }
    const rect = {}
    function handleMouseMove(e) {
      const movePoint = {
        x: e.clientX,
        y: e.clientY
      }
      // 计算鼠标移动距离的区域
      const width = Math.abs(movePoint.x - startPoint.x)
      const height = Math.abs(movePoint.y - startPoint.y)
      console.log(width, height)
      const left = Math.min(movePoint.x, startPoint.x)
      const top = Math.min(movePoint.y, startPoint.y)
      rect.width = width
      rect.height = height
      rect.left = left
      rect.top = top

      // 创建选区
      setSelectedArea(rect)
    }
    function handleMouseUp() {
      document.removeEventListener("mousemove", handleMouseMove)
      document.removeEventListener("mouseup", handleMouseUp)
      clearSelectedArea()
      // 内容脚本将选中区域回传给background.js
      chrome.runtime.sendMessage({
        type: 'selectedArea',
        data: rect
      });
    }


    function setSelectedArea({ width, height, top, left }) {
      const selectArea = document.getElementById('selectArea') || document.createElement('div')
      selectArea.id = 'selectArea'
      selectArea.style.position = 'fixed'
      selectArea.style.top = top + 'px'
      selectArea.style.left = left + 'px'
      selectArea.style.width = width + 'px'
      selectArea.style.height = height + 'px'
      selectArea.style.border = '1px dashed #000'
      selectArea.style.zIndex = '9999'
      selectArea.style.display = 'block'
      !document.getElementById('selectArea') && document.body.appendChild(selectArea)
    }

    function clearSelectedArea() {
      const selectArea = document.getElementById('selectArea')
      selectArea && (selectArea.style.display = 'none')
    }

    document.addEventListener("mousemove", handleMouseMove)
    document.addEventListener("mouseup", handleMouseUp)
  })
}