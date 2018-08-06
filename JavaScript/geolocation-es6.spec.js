'use strict';

let expect = chai.expect;
let assert = chai.assert;

describe('geo module', function() {

    it('should return valid distance between known points', function() {
        let parisLat = 48.8566;
        let parisLon = 2.3522;
        let moscowLat = 55.7558;
        let moscowLon = 37.6173;

        assert.equal(2486, getDistanceFromLatLonInKm(parisLat, parisLon, moscowLat, moscowLon).toFixed(0));
    });

    it('should convert degrees to radians', function() {
        assert.equal(deg2rad(90), Math.PI / 2);
    });

});

describe('partners loading', function() {

    it('should load partners list', function(done) {
        loadPartnersJSON(function(partners) {
            expect(partners).to.be.an('array').that.not.empty;
            done();
        });
    });

});

describe('partners list calculation', function() {

    it('should filter offices by distance', function() {
        let center = { 'lat': 55.7558, 'lon': 37.6173 };
        let partners = [
            { 'organization': 'Org Z', 'offices': [ { 'address': 'Rio', 'coordinates': '-22.970722,-43.182365' } ] },
            { 'organization': 'Org M', 'offices': [ { 'address': 'Berlin', 'coordinates': '52.520008,13.404954' } ] },
            { 'organization': 'Org C', 'offices': [ { 'address': 'Stockholm', 'coordinates': '59.334591,18.063240' } ] },
        ];
        let partnersToInvite = findPartnerOfficesWithinRadius(partners, 3000, center.lat, center.lon);

        expect(partnersToInvite).to.deep.equal([
            { 'org': 'Org C', 'address': 'Stockholm'},
            { 'org': 'Org M', 'address': 'Berlin'},
        ]);
    });

    it('should render partners data', function() {
        let partnersHtml = renderPartnersToInviteList([
            { 'org': 'Org A', 'address': 'London'},
        ]);

        assert.include(partnersHtml, 'Org A');
        assert.include(partnersHtml, 'London');
    });

});
