window.onload = function () {
  chrome.storage.sync.get(["key"], function (result) {
    if (result.key) {
      // showing the API key in the popup
      document.getElementById("api-key").value = result.key;
      document.getElementById("delete-api-key").style.display = "block";
      document.getElementById("delete-api-key").onclick = function () {
        chrome.storage.sync.remove("key", function () {
          if (chrome.runtime.lastError) {
            console.error(chrome.runtime.lastError.message);
          } else {
            console.log('The "key" has been removed successfully.');

            // Reload the current page
            location.reload();
          }
        });
      };

      document.getElementById("api-key").readOnly = true;

      // making the api-key text color to green
      document.getElementById("api-key").style.color = "#8b8b8b";
      // document.getElementById("api-key").style.width = "400px";

      console.log("Value currently is " + result.key);
      // If the API key is stored, hide the input field and "Next" button
      // document.getElementById("api-key").style.display = "none";
      // document.getElementById("key_li").style.display = "none";
      document.getElementById("save-api-key").style.display = "none";
    } else {
      // If the API key is not stored, add a click event listener to the "Next" button
      document
        .getElementById("save-api-key")
        .addEventListener("click", function () {
          var apiKey = document.getElementById("api-key").value;
          chrome.storage.sync.set({ key: apiKey }, function () {
            console.log("API key is set to " + apiKey);
          });

          // Hide the input field and "Next" button
          // chrome.storage.sync.get({ key: apiKey }, function () {
          //   // showing the API key in the popup
          //   document.getElementById("api-key").value = apiKey;
          // });
          // document.getElementById("api-key").style.display = "none";
          // document.getElementById("key_li").style.display = "none";
          document.getElementById("save-api-key").style.display = "none";
          document.getElementById("delete-api-key").style.display = "block";
          // Reload the current page
          location.reload();
        });
    }
  });
};

var popup = {
  ready: function () {
    $(".capture-visible").click(popup.captureVisible);
    $(".capture-all").click(popup.captureAll);
    $(".capture-region").click(popup.captureRegion);
    $(".capture-webcam").click(popup.captureWebcam);
    $(".capture-desktop").click(popup.captureDesktop);
    $(".capture-clipboard").click(popup.captureClipboard);
    $(".blank-canvas").click(popup.paintbrush);
    $(".edit-content").click(popup.editContent);
    $(".settings").click(() => {
      chrome.runtime.openOptionsPage();
    });
    $("#working, #message").click(function () {
      $(this).fadeOut();
    });
    $(".ver").text(extension.version);
    popup.checkSupport();
  },
  paintbrush: () => {
    var backgroundWindow = chrome.extension.getBackgroundPage();
    with (backgroundWindow) {
      if (!screenshot.canvas) {
        screenshot.canvas = document.createElement("canvas");
      }

      screenshot.canvas.width = window.screen.availWidth - 50;
      screenshot.canvas.height = window.screen.availHeight - 250;
      var ctx = screenshot.canvas.getContext("2d");
      ctx.beginPath();
      ctx.rect(0, 0, screenshot.canvas.width, screenshot.canvas.height);
      ctx.fillStyle = "white";
      ctx.fill();
    }
    chrome.tabs.create({
      url: chrome.extension.getURL("editor.html") + "#last",
    });
  },
  notifyTabsForStorageUpdate: function () {
    chrome.extension
      .getBackgroundPage()
      .codeinjector.executeCodeOnAllTabs("extStorageUpdate()");
  },

  checkSupport: function () {
    chrome.tabs.query({ active: true, currentWindow: true }, function (t) {
      t = t[0];
      var url = t.url;
      if (
        url.indexOf("chrome://") >= 0 ||
        url.indexOf("chrome-extension:") >= 0 ||
        url.indexOf("https://chrome.google.com") >= 0
      ) {
        popup.disableScrollSupport();
      }
      if (url.indexOf("file:") == 0) {
        var scriptNotLoaded = setTimeout(popup.disableScrollSupport, 500);
        chrome.tabs.sendMessage(
          t.id,
          {
            type: "checkExist",
          },
          function () {
            if (chrome.runtime.lastError) {
              $("#noall")
                .html(
                  'Go to chrome://extensions, and check the box "Allow access to file URLs"'
                )
                .css({
                  cursor: "pointer",
                  color: "blue",
                  textDecoration: "underline",
                })
                .click(function () {
                  premissions.checkPermissions(
                    { origins: ["<all_urls>"] },
                    function (a) {
                      chrome.tabs.create({
                        url: "chrome://extensions?id=akgpcdalpfphjmfifkmfbpdmgdmeeaeo",
                      });
                    }
                  );
                });
            } else {
              clearTimeout(scriptNotLoaded);
            }
          }
        );
      }
    });
  },

  disableScrollSupport: function () {
    $(".capture-all").hide();
    $(".capture-region").hide();
    $(".edit-content").hide();
    $("#noall").show();
  },

  translationBar: function () {
    var did = ",en,";
    chrome.i18n.getAcceptLanguages(function (lang) {
      var ht = "";
      for (var i = 0; i < lang.length; i++) {
        if (did.indexOf("," + lang[i].substring(0, 2) + ",") >= 0) {
          continue;
        }
        var $e = $('<a lang="' + lang[i] + '" class="btn">' + lang[i] + "</a>");
        $e.on("click", function () {
          var t = this;
          chrome.tabs.create({
            url:
              "https://docs.google.com/forms/d/1PxQumU94cpqjz_p9mQpNIIdW4WBIL-SRARIkk2I4grA/viewform?entry.893813915&entry.1011219305&entry.510290200=" +
              t.getAttribute("lang"),
          });
        });
        $(".window_translate").show().append($e);
      }
    });
  },
  /**
   * Function execution from remote scripts such as background.js
   * @param data
   */
  exec: function (data) {
    $("#working").fadeOut();
    $("#message").fadeOut();
    switch (data.type) {
      case "working":
        $("#working").fadeIn();
        break;
      case "message":
        $("#message").fadeIn().find(".message-container").text(data.message);
        break;
      default:
        console.warn("Invalid message", data);
    }
  },
  captureVisible: function () {
    popup.sendMessage({
      data: "captureVisible",
    });
  },
  captureAll: function () {
    popup.sendMessage({
      data: "captureAll",
    });
  },
  captureRegion: function () {
    popup.sendMessage({
      data: "captureRegion",
    });
  },
  captureWebcam: function () {
    popup.sendMessage({
      data: "captureWebcam",
    });
  },
  captureDesktop: function () {
    chrome.permissions.request(
      { permissions: ["desktopCapture"] },
      function () {
        popup.sendMessage({
          data: "captureDesktop",
        });
      }
    );
  },
  captureClipboard: function () {
    popup.sendMessage({
      data: "captureClipboard",
    });
  },
  editContent: function () {
    popup.sendMessage({
      data: "editContent",
    });
  },
  sendMessage: function (data) {
    chrome.runtime.sendMessage(data, function (x) {
      console.warn("popup_fail", x);
    });
  },
};
$(popup.ready);
