var app = app || {};

(function(module) {

    const contactView = {};
    contactView.init = function () {
        $('main').removeAttr('class').addClass('contact');
        $('main h1').text('call us @');
    }

    module.contactView = contactView;
}(app));