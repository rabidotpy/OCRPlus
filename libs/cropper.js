var cropperLoaded = false;
var removeClip;
var apiKey;
var cropperLoadTime = Date.now();
var cropperOpen = false;
// Define downloadedImageFilename and downloadedImageUrl in a higher scope
var downloadedImageFilename;
var downloadedImageUrl;
function loadCropper() {
  if (cropperLoaded) {
    return;
  }
  cropperLoaded = true;

  removeClip = function () {
    if (
      window.crop &&
      window.crop.icons &&
      Date.now() - cropperLoadTime > 1000
    ) {
      removeClipInstant();
      cropperOpen = false;
    }
  };
  function removeClipInstant() {
    window.crop.icons.detach();
    $("#crop_helper").add(".crop_handle").remove();
    $(document).off(".removeCrop");
  }

  showCropOverFlow = function () {
    console.log("showCropOverFlow");
    removeClipInstant();
    var minWidth = 60;
    var minHeight = minWidth;

    if (window.crop.y2 - window.crop.y1 < minHeight)
      window.crop.y2 = window.crop.y1 + minHeight;
    if (window.crop.x2 - window.crop.x1 < minWidth)
      window.crop.x2 = window.crop.x1 + minWidth;

    if (window.crop.x1 < 0) window.crop.x1 = 0;
    if (window.crop.y1 < 0) window.crop.y1 = 0;
    if (window.crop.y2 < 0) window.crop.y2 = 0;
    if (window.crop.x2 > $(document).width() - 5)
      window.crop.x2 = $(document).width() - 5;
    if (window.crop.y2 > $(document).height() - 5)
      window.crop.y2 = $(document).height() - 5;

    x1 = window.crop.x1;
    x2 = window.crop.x2;
    y1 = window.crop.y1;
    y2 = window.crop.y2;

    // objects_hide();
    if (x1 < x2) {
      rx1 = x1;
      rx2 = x2;
    } else {
      rx1 = x2;
      rx2 = x1;
    }
    if (y1 < y2) {
      ry1 = y1;
      ry2 = y2;
    } else {
      ry1 = y2;
      ry2 = y1;
    }
    x1 = rx1;
    x2 = rx2;
    y1 = ry1;
    y2 = ry2;

    $(
      "<div id=crop_helper><div id=crop_center></div><div id=crop_helper_bottom></div><div id=crop_helper_left></div><div id=crop_helper_top></div><div id=crop_helper_right></div></div>"
    ).appendTo(document.body);

    $("#crop_helper").css({
      // position:'absolute',
      // width:'100%',
      // height:'100%',
      // top:'0px',
      // left: -  ($(document).width() - $(document.body).width()) + 'px'
    });
    if (window.crop.move)
      $("#crop_helper").css("cursor", window.crop.move + "-resize");
    $("#crop_helper *").css({
      "background-color": "#000000", // this is color of the screen
      opacity: "0.8",
      position: "absolute",
      "z-index": 10000,
    });
    $("#crop_helper_left").css({
      "background-color": "000", // this is color of the crop area
      left: 0,
      top: 0,
      width: x1,
      height: $(document).height(),
    });
    $("#crop_helper_top").css({
      "background-color": "000",
      left: x1,
      top: 0,
      width: x2 - x1,
      height: y1,
    });
    $("#crop_helper_bottom").css({
      "background-color": "000",
      left: x1,
      top: y2,
      width: x2 - x1,
      height: $(document).height() - y2,
    });
    $("#crop_helper_right").css({
      "background-color": "000",
      left: x2,
      top: 0,
      width: $(document).width() - x2,
      height: $(document).height(),
    });
    $("#crop_center").css({
      "background-color": "#505050a6", // this is color of the crop area
      cursor: "move",
      left: x1,
      top: y1,
      width: x2 - x1,
      height: y2 - y1,
    });
    $("#crop_center").data("cord", {
      x1: x1,
      x2: x2,
      y1: y1,
      y2: y2,
    });

    hw = 8;
    e = $("<div class=crop_handle></div>").css({
      width: hw,
      height: hw,
      "background-color": "black",
      position: "absolute",
      "z-index": 10001,
    });
    obj = {
      ne: {
        x: x2 - hw,
        y: y1,
      },
      nw: {
        x: x1,
        y: y1,
      },
      se: {
        x: x2 - hw,
        y: y2 - hw,
      },
      sw: {
        x: x1,
        y: y2 - hw,
      },
      n: {
        x: x1 + (x2 - x1) / 2,
        y: y1,
      },
      s: {
        x: x1 + (x2 - x1) / 2,
        y: y2 - hw,
      },
      w: {
        y: y1 + (y2 - y1) / 2,
        x: x1,
      },
      e: {
        y: y1 + (y2 - y1) / 2,
        x: x2 - hw,
      },
    };
    var icons = window.crop.icons;
    // icons.hide();
    icons
      .css({
        "z-index": 10005,
        position: "absolute",
      })
      .appendTo("#crop_helper");
    // .position({
    // 	my: 'right top',
    // 	at: 'right bottom+6',
    // 	of: $('#crop_center')
    // });
    position1 = {
      left: $("#crop_center").offset().left,
      top: $("#crop_center").offset().top + $("#crop_center").height() + 10,
      position: "static",
    };
    position2 = {
      left: $("#crop_center").offset().left,
      top: $("#crop_center").offset().top - icons.height() - 10,
      position: "static",
    };
    // console.log(icons.width())
    position3 = {
      left: ($(window).width() - icons.width()) / 2,
      top: 0,
      position: "fixed",
    };
    position = position3;
    icons.css({
      left: position.left,
      top: position.top,
      position: position.position,
    });

    for (var i in obj)
      e.clone()
        .data("cord", i)
        .css({
          left: obj[i].x,
          top: obj[i].y,
          cursor: i + "-resize",
        })
        .appendTo($("#crop_helper"));
  };
  $(document).on("keyup", function (e) {
    removeClip();
  });
  $(document).on("click", "div[id*=crop_helper_]", function () {
    removeClip();
  });

  scrollOnMove = function (e) {
    if (e.pageY > document.body.scrollTop + $(window).height() - 30)
      document.body.scrollTop += 30;
    if (e.pageY < document.body.scrollTop + 30) document.body.scrollTop -= 30;
  };

  $(document).on("mousedown", "#crop_center", function (e) {
    console.log("mousedown");
    $(document).on("mousemove.cropcenter", function (e) {
      if (window.crop.startX) {
        window.crop.x1 += e.pageX - window.crop.startX;
        window.crop.x2 += e.pageX - window.crop.startX;
        window.crop.y1 += e.pageY - window.crop.startY;
        window.crop.y2 += e.pageY - window.crop.startY;
      }
      showCropOverFlow();
      window.crop.startX = e.pageX;
      window.crop.startY = e.pageY;
      scrollOnMove(e);
      e.stopPropagation();
      return false;
    });
    $(document).on("mouseup.cropcenter", function (e) {
      window.crop.startX = null;
      window.crop.startY = null;
      $(document).off(".cropcenter");
      e.stopPropagation();
      return false;
    });
  });
  $(document).on("mousedown", ".crop_handle", function (e) {
    var lastScreenX, lastScreenY;
    scrollOnMove(e);
    $(document).on(
      "mousemove.handle",
      {
        cord: $(e.target).data("cord"),
      },
      function (e) {
        if (lastScreenX) {
          var dirX = lastScreenX < e.screenX ? "right" : "left";
          var dirY = lastScreenY < e.screenY ? "down" : "up";
        }
        lastScreenX = e.screenX;
        lastScreenY = e.screenY;
        cord = e.data.cord;
        if (cord == "se") {
          window.crop.x2 = e.pageX;
          window.crop.y2 = e.pageY;
        }
        if (cord == "sw") {
          window.crop.x1 = e.pageX;
          window.crop.y2 = e.pageY;
        }
        if (cord == "nw") {
          window.crop.x1 = e.pageX;
          window.crop.y1 = e.pageY;
        }
        if (cord == "ne") {
          window.crop.x2 = e.pageX;
          window.crop.y1 = e.pageY;
        }
        if (cord == "w") {
          window.crop.x1 = e.pageX;
        }
        if (cord == "e") {
          window.crop.x2 = e.pageX;
        }
        if (cord == "n") {
          window.crop.y1 = e.pageY;
        }
        if (cord == "s") {
          window.crop.y2 = e.pageY;
        }
        window.crop.move = cord;
        scrollOnMove(e);
        showCropOverFlow();
        e.stopPropagation();
        return false;
      }
    );
    $(document).on("mouseup.handle", function (e) {
      window.crop.move = null;
      showCropOverFlow();
      $(document).off(".handle");
      e.stopPropagation();
      return false;
    });
    e.stopPropagation();
    return false;
  });
}

function getApiKey() {
  return new Promise((resolve, reject) => {
    chrome.storage.sync.get(["key"], function (result) {
      if (chrome.runtime.lastError) {
        return reject(chrome.runtime.lastError);
      }
      resolve(result.key);
    });
  });
}

function load_cropper_without_selection(rect) {
  loadCropper();
  if (cropperOpen) {
    return;
  }
  // removeClip();
  // cropperOpen = true;
  // cropperLoadTime = Date.now();
  // window.crop = rect || {
  //   x1: document.body.scrollLeft + 300,
  //   x2: document.body.scrollLeft + 600,
  //   y1: document.body.scrollTop + 300,
  //   y2: document.body.scrollTop + 600,
  // };

  removeClip();
  cropperOpen = true;
  cropperLoadTime = Date.now();
  function getViewportCenter() {
    var viewportWidth =
      window.innerWidth || document.documentElement.clientWidth;
    var viewportHeight =
      window.innerHeight || document.documentElement.clientHeight;
    var scrollX = window.scrollX || window.pageXOffset;
    var scrollY = window.scrollY || window.pageYOffset;

    return {
      x: scrollX + viewportWidth / 2,
      y: scrollY + viewportHeight / 2,
    };
  }

  // Example usage
  var center = getViewportCenter();
  console.log("Viewport Center:", center);

  // Use getViewportCenter to get the center of the viewport
  var viewportCenter = getViewportCenter();

  window.crop = rect || {
    x1: viewportCenter.x - 150, // Adjust this value based on your rectangle size
    x2: viewportCenter.x + 150, // Adjust this value based on your rectangle size
    y1: viewportCenter.y - 150, // Adjust this value based on your rectangle size
    y2: viewportCenter.y + 150, // Adjust this value based on your rectangle size
  };

  $("html").css("position", "inherit");
  var $toolbar = $(
    '<div class=ws-styles><table style="border: 0;"><tr style="border: 0;vertical-align: middle"><td style="border: 0;vertical-align: middle"><button class="save msg" style="margin:1px;color:black;background-color:white;cursor:pointer;font-size:1em;border: 1px solid #999; border-radius: 4px;padding: 3px 9px;" tag=save></button></td><td style="border: 0;vertical-align: middle"><div class=realToolbar></div></td></tr></table></div>'
  );
  // var $toolbar = $(
  //   '<div class=ws-styles><table style="border: 0;"><tr style="border: 0;vertical-align: middle"><td style="border: 0;vertical-align: middle"><button class="open msg" style="margin:1px;color:black;background-color:white;cursor:pointer;font-size:1em;border: 1px solid #999; border-radius: 4px;padding: 3px 9px;" tag=open></button>' +
  //     '<button class="save msg" style="margin:1px;color:black;background-color:white;cursor:pointer;font-size:1em;border: 1px solid #999; border-radius: 4px;padding: 3px 9px;" tag=save></button>' +
  //     '<button class="share msg" tag=share style="margin:1px;color:black;background-color:white;cursor:pointer;font-size:1em;border: 1px solid #999; border-radius: 4px;padding: 3px 9px;"></button></td><td style="border: 0;vertical-align: middle"><div class=realToolbar></div></td></tr></table></div>'
  // );

  jQuery(".msg", $toolbar).each(function () {
    jQuery(this).html(chrome.i18n.getMessage(jQuery(this).attr("tag")));
  });
  var $realToolbar = $(".realToolbar", $toolbar);

  window.crop.icons = $toolbar;
  plugins_to_show = defaultPlugins.slice();
  plugins_to_show = $.grep(plugins_to_show, function (o) {
    return (
      // o.key!='openscreenshot' &&
      o.key != "googledrive"
    );
  });

  // $("button.open", $toolbar).on("click", function () {
  //   removeClip();
  //   chrome.runtime.sendMessage({
  //     data: "captureAll",
  //     showScrollBar: true,
  //     disableHeaderAndFooter: true,
  //     processFixedElements: false,
  //     cropData: {
  //       x1: x1,
  //       x2: x2,
  //       y1: y1,
  //       y2: y2,
  //       scrollTop: document.body.scrollTop,
  //       scrollLeft: document.body.scrollLeft,
  //     },
  //   });
  // });

  // $("button.save", $toolbar).on("click", function () {
  //   $("[plugin-key=save]").trigger(
  //     $.Event({
  //       type: "click",
  //     })
  //   );
  // });

  $("button.save", $toolbar).on("click", function () {
    // Trigger the original save functionality
    $("[plugin-key=save]").trigger(
      $.Event({
        type: "click",
      })
    );
    // Create a flag variable
    var responseReceived = false;

    $(document).on("imageDownloaded", function (event, filename, url) {
      // Assign the filename and url of the downloaded image to downloadedImageFilename and downloadedImageUrl
      downloadedImageFilename = filename;
      downloadedImageUrl = url;
    });

    // Create a textarea element
    var textarea = $("<textarea/>").on("keypress", function (e) {
      // Check if a response has been received
      if (responseReceived) {
        // If a response has been received, don't make a request
        return;
      }

      // Check if the Enter key was pressed
      if (e.which == 13) {
        // Prevent the default action
        e.preventDefault();

        // Log the textarea value and the image filename and url to the console, then clear the textarea
        console.log("Text:", $(this).val());
        console.log("Image filename:", downloadedImageFilename);
        console.log("Image url:", downloadedImageUrl);

        // getting the localStorage.setItem("savedImage", base64data); from the content script
        var base64data = localStorage.getItem("savedImage");

        // console.log("base64data: ", base64data);
        // Send the base64 data to the background script
        // chrome.runtime.sendMessage({ base64data: base64data });
        // var base64data = localStorage.getItem("savedImage");

        // console.log("base64data: ", base64data);

        // document
        //   .getElementById("api-key")
        //   .addEventListener("change", function () {
        //     localStorage.setItem("API_KEY", this.value);
        //   });

        // chrome.storage.sync.get(["key"], function (result) {
        //   var apiKey = result.key;
        //   useApiKey(apiKey);
        // });
        getApiKey()
          .then((apiKey) => {
            console.log("apiKey: ", apiKey);
            var headers = new Headers();
            headers.append("Content-Type", "application/json");
            headers.append("Authorization", `Bearer ${apiKey}`);
            // headers.append(
            //   "Authorization",
            //   "Bearer OPENAI_API_KEY_HERE"
            // );

            var body = JSON.stringify({
              model: "gpt-4-vision-preview",
              messages: [
                {
                  role: "user",
                  content: [
                    { type: "text", text: `${$(this).val()}` },
                    {
                      type: "image_url",
                      image_url: `${base64data}`,
                    },
                  ],
                },
              ],
              max_tokens: 300,
            });

            // console.log("body: ", body);
            let responses;

            fetch("https://api.openai.com/v1/chat/completions", {
              method: "POST",
              headers: headers,
              body: body,
            })
              .then((response) => response.json())
              .then((data) => {
                // changing the textarea value to responses
                $(this).val("");
                var content = data.choices[0].message.content;
                textarea.val(content);

                // the content should be automatically copied to the clipboard

                // adjust the size of the textarea based on the content length
                var lines = content.split("\n").length;
                textarea.attr("rows", lines);

                // apply dark mode style
                textarea.css({
                  backgroundColor: "#333", // dark gray background
                  color: "#fff", // white text
                  padding: "10% 10%", // top/bottom padding 10%, left/right padding 10%
                  border: "1px solid black",
                  zIndex: 9999,
                  width: "500px",
                  height: "250px",
                });

                // make the textarea read-only
                textarea.prop("readonly", true);
                // Show the close button
                closeButton.css("display", "block");

                // Set the flag to true
                responseReceived = true;

                // copy content to clipboard after 4 seconds
                setTimeout(function () {
                  navigator.clipboard.writeText(content).then(
                    function () {
                      console.log("Copying to clipboard was successful!");
                    },
                    function (err) {
                      console.error("Could not copy text: ", err);
                    }
                  );
                }, 4000); // 4000 milliseconds = 4 seconds
              })
              .catch((error) => console.error("Error:", error));
          })
          .catch((error) => console.error("Error:", error));

        // console.log("responses: ", responses);

        $(this).val("wait for it...");
      }
    });

    // Create a popup with the textarea
    var popup = $("<div/>")
      .css({
        position: "fixed",
        top: "50%",
        left: "50%",
        transform: "translate(-50%, -50%)",
        backgroundColor: "#f9f9f9", // light gray background
        border: "1px solid #ccc", // light gray border
        borderRadius: "10px", // rounded corners
        boxShadow: "0 2px 10px rgba(0, 0, 0, 0.1)", // shadow effect
        padding: "20px", // space around the content
        zIndex: 9999,
        transition: "all 0.3s ease", // transition effect
      })
      .append(textarea);

    // Create the cross button
    var closeButton = $("<button/>")
      .text("X")
      .css({
        position: "absolute",
        top: "0",
        right: "0",
        borderRadius: "10%",
        backgroundColor: "rgba(255, 0, 0, 0.5)",
        display: "none", // initially hide the butto
      })
      .on("click", function () {
        popup.remove();
      })
      .appendTo(popup);

    // Append the popup to the body
    $("body").append(popup);

    // Prevent the default action
    return false;
  });

  // $('button.open',$toolbar).on('click',function (){
  // 	$('[plugin-key=open]').trigger($.Event({type:'click'}))
  // })

  // $("button.share", $toolbar).on("click", function () {
  //   $("[plugin-key=openscreenshot]").trigger(
  //     $.Event({
  //       type: "click",
  //     })
  //   );
  // });

  var staticPlugin = new Toolbar({
    plugins: plugins_to_show,
    element: $realToolbar,
    namespace: "imageToolbar",
    button_size: "20",
    lines: 2,
    page_title: $("title").html() || "no title",
    page_description: "no description",
    page_url: location.href,
    icon_base: chrome.extension
      ? chrome.extension.getURL("/images/")
      : "../images/",
    whiteIcons: true,
    position: "static",
    type: "image",
    zIndex: 11000,
    request: function (callback) {
      removeClip();
      chrome.runtime.sendMessage(
        {
          data: "captureAll",
          runCallback: true,
          keepIt: true,
          showScrollBar: true,
          disableHeaderAndFooter: true,
          processFixedElements: false,
          cropData: {
            x1: x1,
            x2: x2,
            y1: y1,
            y2: y2,
            scrollTop: document.body.scrollTop,
            scrollLeft: document.body.scrollLeft,
          },
        },
        function (x) {
          callback(x);
        }
      );
    },
  });
  showCropOverFlow();
}
