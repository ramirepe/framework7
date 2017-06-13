import $ from 'dom7';
import Utils from '../../utils/utils';
import Panel from './panel-class';

export default {
  name: 'panel',
  params: {
    panel: {
      leftBreakpoint: 0,
      rightBreakpoint: 0,
      swipe: undefined, // or 'left' or 'right' or 'both'
      swipeActiveArea: 0,
      swipeCloseOpposite: true,
      swipeOnlyClose: false,
      swipeNoFollow: false,
      swipeThreshold: 0,
      closeByOutsideClick: true,
    },
  },
  static: {
    Panel,
  },
  instance: {
    panel: {
      allowOpen: true,
    },
  },
  create() {
    const app = this;
    Utils.extend(app.panel, {
      create(el) {
        return new Panel(app, { el });
      },
      open(side, animate) {
        let panelSide = side;
        if (!panelSide) {
          if ($('.panel').length > 1) {
            return false;
          }
          panelSide = $('.panel').hasClass('panel-left') ? 'left' : 'right';
        }
        if (!panelSide) return false;
        if (app.panel[panelSide]) {
          return app.panel[panelSide].open(animate);
        }
        const $panelEl = $(`.panel-${panelSide}`);
        if ($panelEl.length > 0) {
          return new Panel(app, { el: $panelEl }).open(animate);
        }
        return false;
      },
      close(side, animate) {
        let $panelEl;
        let panelSide;
        if (panelSide) {
          panelSide = side;
          $panelEl = $(`.panel-${panelSide}`);
        } else {
          $panelEl = $('.panel.panel-active');
          panelSide = $panelEl.hasClass('panel-left') ? 'left' : 'right';
        }
        if (!panelSide) return false;
        if (app.panel[panelSide]) {
          return app.panel[panelSide].close(animate);
        }
        if ($panelEl.length > 0) {
          return new Panel(app, { el: $panelEl }).close(animate);
        }
        return false;
      },
    });
  },
  on: {
    init() {
      const app = this;

      // Create Panels
      $('.panel').each((index, panelEl) => {
        const side = $(panelEl).hasClass('panel-left') ? 'left' : 'right';
        app.panel[side] = new Panel(app, { el: panelEl, side });
      });
    },
  },
  clicks: {
    '.panel-open': function open(clickedEl, data = {}) {
      const app = this;
      let side = 'left';
      if (data.panel === 'right' || ($('.panel').length === 1 && $('.panel').hasClass('panel-right'))) {
        side = 'right';
      }
      app.panel.open(side, data.animate);
    },
    '.panel-close': function close(clickedEl, data = {}) {
      const app = this;
      const side = data.panel;
      app.panel.close(side, data.animate);
    },
    '.panel-backdrop': function close() {
      const app = this;
      $('.panel-active').trigger('panelBackdropClick panel:backdrop-click');
      if (app.params.panel.closeByOutsideClick) app.panel.close();
    },
  },
};
