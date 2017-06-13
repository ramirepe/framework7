import $ from 'dom7';
import Utils from '../../utils/utils';
import Modal from '../modal/modal-class';

class Popover extends Modal {
  constructor(app, params) {
    const extendedParams = Utils.extend({
      on: {},
    }, params);

    // Extends with open/close Modal methods;
    super(app, extendedParams);

    const popover = this;

    popover.params = extendedParams;

    // Find Element
    let $el;
    if (!popover.params.el) {
      $el = $(popover.params.html);
    } else {
      $el = $(popover.params.el);
    }

    if ($el && $el.length > 0 && $el[0].f7Modal) {
      return $el[0].f7Modal;
    }

    // Find Target
    const $targetEl = $(popover.params.targetEl).eq(0);

    if ($el.length === 0 || $targetEl.length === 0) {
      return popover.destroy();
    }

    // backdrop
    let $backdropEl = app.root.children('.popover-backdrop');
    if ($backdropEl.length === 0) {
      $backdropEl = $('<div class="popover-backdrop"></div>');
      app.root.append($backdropEl);
    }

    // Find Angle
    let $angleEl;
    if ($el.find('.popover-angle').length === 0) {
      $angleEl = $('<div class="popover-angle"></div>');
      $el.prepend($angleEl);
    } else {
      $angleEl = $el.find('.popover-angle');
    }

    Utils.extend(popover, {
      app,
      $el,
      el: $el[0],
      $targetEl,
      targetEl: $targetEl[0],
      $angleEl,
      angleEl: $angleEl[0],
      $backdropEl,
      backdropEl: $backdropEl[0],
      type: 'popover',
    });

    function handleResize() {
      popover.resize();
    }
    popover.once('popoverOpen', () => {
      popover.resize();
      app.on('resize', handleResize);
      popover.once('popoverClose', () => {
        app.off('resize', handleResize);
      });
    });

    $el[0].f7Modal = popover;

    return popover;
  }
  resize() {
    const popover = this;
    const { app, $el, $targetEl, $angleEl } = popover;
    $el.css({ left: '', top: '' });
    const [width, height] = [$el.width(), $el.height()];
    let angleSize = 0;
    let angleLeft;
    let angleTop;
    if (app.theme === 'ios') {
      $angleEl.removeClass('on-left on-right on-top on-bottom').css({ left: '', top: '' });
      angleSize = $angleEl.width() / 2;
    } else {
      $el.removeClass('popover-on-left popover-on-right popover-on-top popover-on-bottom').css({ left: '', top: '' });
    }

    const targetWidth = $targetEl.outerWidth();
    const targetHeight = $targetEl.outerHeight();
    const targetOffset = $targetEl.offset();
    const targetOffsetLeft = targetOffset.left - app.left;
    let targetOffsetTop = targetOffset.top - app.top;
    const targetParentPage = $targetEl.parents('.page');
    if (targetParentPage.length > 0) {
      targetOffsetTop -= targetParentPage[0].scrollTop;
    }

    let [left, top, diff] = [0, 0, 0];
    // Top Position
    let position = app.theme === 'md' ? 'bottom' : 'top';
    if (app.theme === 'md') {
      if (height < app.height - targetOffsetTop - targetHeight) {
        // On bottom
        position = 'bottom';
        top = targetOffsetTop;
      } else if (height < targetOffsetTop) {
        // On top
        top = (targetOffsetTop - height) + targetHeight;
        position = 'top';
      } else {
        // On middle
        position = 'bottom';
        top = targetOffsetTop;
      }

      if (top <= 0) {
        top = 8;
      } else if (top + height >= app.height) {
        top = app.height - height - 8;
      }

      // Horizontal Position
      left = targetOffsetLeft;
      if (left + width >= app.width - 8) {
        left = (targetOffsetLeft + targetWidth) - width - 8;
      }
      if (left < 8) {
        left = 8;
      }
      if (position === 'top') {
        $el.addClass('popover-on-top');
      }
      if (position === 'bottom') {
        $el.addClass('popover-on-bottom');
      }
      if ($targetEl.hasClass('floating-button-to-popover') && !$el.hasClass('modal-in')) {
        $el.addClass('popover-from-fab');
        const diffX = ((left + width) / 2) - ((targetOffsetLeft + targetWidth) / 2);
        const diffY = ((top + height) / 2) - ((targetOffsetTop + targetHeight) / 2);
        $targetEl
          .addClass('floating-button-to-popover-in')
          .transform(`translate3d(${diffX}px, ${diffY}px,0)`)
          .transitionEnd(() => {
            if (!$targetEl.hasClass('floating-button-to-popover-in')) return;
            $targetEl
              .addClass('floating-button-to-popover-scale')
              .transform(`translate3d(${diffX}px, ${diffY}px,0) scale(${width / targetWidth}, ${height / targetHeight})`);
          });

        $el.once('popover:close', () => {
          $targetEl
            .removeClass('floating-button-to-popover-in floating-button-to-popover-scale')
            .addClass('floating-button-to-popover-out')
            .transform('')
            .transitionEnd(() => {
              $targetEl.removeClass('floating-button-to-popover-out');
            });
        });
        $el.once('popover:closed', () => {
          $el.removeClass('popover-from-fab');
        });
      } else if ($targetEl.hasClass('floating-button-to-popover') && $el.hasClass('modal-in')) {
        left = targetOffsetLeft;
        top = targetOffsetTop;
      }
    } else {
      if ((height + angleSize) < targetOffsetTop) {
        // On top
        top = targetOffsetTop - height - angleSize;
      } else if ((height + angleSize) < app.height - targetOffsetTop - targetHeight) {
        // On bottom
        position = 'bottom';
        top = targetOffsetTop + targetHeight + angleSize;
      } else {
        // On middle
        position = 'middle';
        top = ((targetHeight / 2) + targetOffsetTop) - (height / 2);
        diff = top;
        if (top <= 0) {
          top = 5;
        } else if (top + height >= app.height) {
          top = app.height - height - 5;
        }
        diff -= top;
      }

      // Horizontal Position
      if (position === 'top' || position === 'bottom') {
        left = ((targetWidth / 2) + targetOffsetLeft) - (width / 2);
        diff = left;
        if (left < 5) left = 5;
        if (left + width > app.width) left = app.width - width - 5;
        if (left < 0) left = 0;
        if (position === 'top') {
          $angleEl.addClass('on-bottom');
        }
        if (position === 'bottom') {
          $angleEl.addClass('on-top');
        }
        diff -= left;
        angleLeft = ((width / 2) - angleSize) + diff;
        angleLeft = Math.max(Math.min(angleLeft, width - (angleSize * 2) - 13), 13);
        $angleEl.css({ left: `${angleLeft}px` });
      } else if (position === 'middle') {
        left = targetOffsetLeft - width - angleSize;
        $angleEl.addClass('on-right');
        if (left < 5 || (left + width > app.width)) {
          if (left < 5) left = targetOffsetLeft + targetWidth + angleSize;
          if (left + width > app.width) left = app.width - width - 5;
          $angleEl.removeClass('on-right').addClass('on-left');
        }
        angleTop = ((height / 2) - angleSize) + diff;
        angleTop = Math.max(Math.min(angleTop, height - (angleSize * 2) - 13), 13);
        $angleEl.css({ top: `${angleTop}px` });
      }
    }

    // Apply Styles
    $el.css({ top: `${top}px`, left: `${left}px` });
  }
}

export default Popover;
