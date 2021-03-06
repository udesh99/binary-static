const BinaryPjax   = require('../../../../base/binary_pjax');
const Client       = require('../../../../base/client');
const BinarySocket = require('../../../../base/socket');
const localize     = require('../../../../../_common/localize').localize;
const State        = require('../../../../../_common/storage').State;


const professionalClient = (() => {
    let is_in_page = false;

    const onLoad = () => {
        BinarySocket.wait('get_account_status', 'landing_company').then(() => {
            init(Client.isAccountOfType('financial'), true);
        });
    };

    const init = (is_financial, is_page) => {
        is_in_page = !!is_page;
        BinarySocket.wait('landing_company').then(() => { populateProfessionalClient(is_financial); });
    };

    const populateProfessionalClient = (is_financial) => {
        const has_maltainvest = State.getResponse('landing_company.financial_company.shortcode') === 'maltainvest';
        if (!has_maltainvest || !is_financial) { // then it's not upgrading to financial
            if (is_in_page) {
                BinaryPjax.loadPreviousUrl();
            }
            return;
        }

        const status = State.getResponse('get_account_status.status') || [];
        if (is_in_page && /professional/.test(status)) {
            $('#loading').remove();
            $('#frm_professional').setVisibility(0);
            $(`#${/professional_requested/.test(status) ? 'processing' : 'professional'}`).setVisibility(1);
            return;
        }

        const $container        = $('#fs_professional');
        const $chk_professional = $container.find('#chk_professional');
        const $info             = $container.find('#professional_info');
        const $popup_contents   = $container.find('#popup');
        const $error            = $('#form_message');
        const popup_selector    = '#professional_popup';

        $container.find('#professional_info_toggle').off('click').on('click', function() {
            $(this).toggleClass('open');
            $info.slideToggle();
            $(`#${Client.get('residence') === 'gb' ? '' : 'non_'}uk`).toggleClass('invisible');
        });

        $chk_professional.on('change', () => {
            if ($chk_professional.is(':checked')) {
                $error.text('').setVisibility(0);

                if (!$(popup_selector).length) {
                    $('body').append($('<div/>', { id: 'professional_popup', class: 'lightbox' }).append($popup_contents.clone().setVisibility(1)));

                    const $popup = $(popup_selector);
                    $popup.find('#btn_accept, #btn_decline').off('click').on('click dblclick', function () {
                        if ($(this).attr('data-value') === 'decline') {
                            $chk_professional.prop('checked', false);
                        }
                        $popup.remove();
                    });
                }
            }
        });

        $container.setVisibility(1);

        if (is_in_page) {
            $('#loading').remove();
            $('#frm_professional')
                .off('submit')
                .on('submit', (e) => {
                    e.preventDefault();
                    if ($chk_professional.is(':checked')) {
                        BinarySocket.wait('get_settings').then((res) => {
                            BinarySocket.send(populateReq(res.get_settings)).then((response) => {
                                if (response.error) {
                                    $error.text(response.error.message).setVisibility(1);
                                } else {
                                    BinarySocket.send({ get_account_status: 1 }).then(() => {
                                        populateProfessionalClient(true);
                                    });
                                }
                            });
                        });
                    } else {
                        $error.text(localize('This field is required.')).setVisibility(1);
                    }
                })
                .setVisibility(1);
        }

        $(document).on('keydown click', (e) => {
            const $popup = $(popup_selector);
            if ((e.which === 27 || $(e.target).hasClass('lightbox')) && $popup.length) {
                $popup.remove();
                $chk_professional.prop('checked', false);
            }
        });
    };

    const populateReq = (get_settings) => {
        const req = {
            set_settings               : 1,
            request_professional_status: 1,
        };

        if (get_settings.tax_identification_number) {
            req.tax_identification_number = get_settings.tax_identification_number;
        }
        if (get_settings.tax_residence) {
            req.tax_residence = get_settings.tax_residence;
        }

        return req;
    };

    return {
        onLoad,
        init,
    };
})();

module.exports = professionalClient;
