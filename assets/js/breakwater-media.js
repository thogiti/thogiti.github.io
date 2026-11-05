(function () {
  'use strict';

  var links = document.querySelectorAll('.breakwater-zoom');
  if (links.length && typeof HTMLDialogElement !== 'undefined') {
    var dialog = document.createElement('dialog');
    dialog.className = 'breakwater-dialog';
    dialog.setAttribute('aria-labelledby', 'breakwater-dialog-title');
    dialog.setAttribute('aria-describedby', 'breakwater-dialog-caption');
    dialog.innerHTML = '<div class="breakwater-dialog-header">' +
      '<h2 id="breakwater-dialog-title">Full-resolution figure</h2>' +
      '<button type="button" autofocus>Close figure</button></div>' +
      '<div id="breakwater-dialog-caption" class="breakwater-dialog-caption"></div>' +
      '<div class="breakwater-dialog-scroll"><img alt=""></div>';
    document.body.appendChild(dialog);
    dialog.querySelector('button').addEventListener('click', function () {
      dialog.close();
    });
    links.forEach(function (link) {
      link.addEventListener('click', function (event) {
        if (event.ctrlKey || event.metaKey || event.shiftKey || event.altKey) return;
        event.preventDefault();
        var source = link.querySelector('img');
        var caption = link.closest('figure').querySelector('figcaption');
        var full = dialog.querySelector('img');
        full.src = link.href;
        full.alt = source.alt;
        dialog.querySelector('.breakwater-dialog-caption').replaceChildren(
          ...Array.from(caption.childNodes, function (node) { return node.cloneNode(true); })
        );
        dialog.showModal();
      });
    });
  }

  document.querySelectorAll('.breakwater-video video').forEach(function (video, index) {
    var player = document.createElement('div');
    player.className = 'breakwater-player';
    video.parentNode.insertBefore(player, video);
    player.appendChild(video);
    video.id = 'breakwater-video-' + index;
    video.tabIndex = 0;
    var button = document.createElement('button');
    button.type = 'button';
    button.className = 'breakwater-play';
    button.setAttribute('aria-controls', video.id);
    button.innerHTML = '<svg viewBox="0 0 32 32" aria-hidden="true" focusable="false">' +
      '<path d="M11 6v20l16-10z"/></svg><span></span>';
    player.appendChild(button);
    function update() {
      var action = video.ended ? 'Replay' : video.currentTime > 0 ? 'Resume' : 'Play';
      button.querySelector('span').textContent = action + ' animation';
      button.setAttribute('aria-label', action + ' Discover attack path animation');
      button.disabled = false;
      button.hidden = !video.paused && !video.ended;
    }
    button.addEventListener('click', async function () {
      button.disabled = true;
      try {
        if (video.ended) video.currentTime = 0;
        await video.play();
        video.focus({ preventScroll: true });
      } catch (error) {
        // Native controls and the direct MP4 link remain available.
      } finally {
        update();
      }
    });
    ['playing', 'pause', 'ended', 'error', 'emptied'].forEach(function (event) {
      video.addEventListener(event, update);
    });
    update();
  });
})();
