'use strict';

document.addEventListener('DOMContentLoaded', function() {
    loadPartnersJSON(function(partners) {
        let partnersToInvite = findPartnerOfficesWithinRadius(partners, 100, 51.515419, -0.141099);
        let partnersListHtml = renderPartnersToInviteList(partnersToInvite);
        setInnerHtmlByElementId('partnersList', partnersListHtml);
    });
});

function findPartnerOfficesWithinRadius(allPartners, radiusKm, centerLat, centerLon) {
    let result = [];

    for (let company of allPartners) {
        for (let office of company.offices) {
            let [ lat, lon ] = office.coordinates.split(',');
            let distance = getDistanceFromLatLonInKm(centerLat, centerLon, lat, lon);

            if (radiusKm >= distance) {
                result.push({
                    'org': company.organization,
                    'address': office.address,
                });

                // break;
                // Do not break here as in case a company has several matching offices
                // all of those should be invited
            }
        }
    }

    result.sort(
        (a, b) => (a.org > b.org) ? 1 : ((b.org > a.org) ? -1 : 0)
    );

    return result;
}

function renderPartnersToInviteList(partners) {
    return partners.map(
        (p) => `<li><strong>${ p.org }</strong> <i>${ p.address }</i></li>`
    ).join('');
}

function setInnerHtmlByElementId(eltId, innerHtml) {
    document.querySelector('#' + eltId).innerHTML = innerHtml;
}