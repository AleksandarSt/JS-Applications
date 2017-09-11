let chirpService=(()=> {

    function getAllChirpsFromSubscription(subscriptions) {
        let endPoint = 'chirps' + `?query={"author":{"$in": [${subscriptions}]}}&sort={"_kmd.ect": 1}`;
        return requester.get('appdata', 'chirps', endPoint)
    }

    function getChirpsByUsername(username) {
        let endpoint = `chirps?query={"author":"${username}"}&sort={"_kmd.ect": 1}`;
        return requester.get('appdata', endpoint)
    }

    function createChirp(data) {
        /*https://baas.kinvey.com/appdata/app_key/chirps*/
        return requester.post('appdata','chirps','kinvey',data)

    }

    return {
        getAllChirpsFromSubscription,
        getChirpsByUsername,
        createChirp
    }
})();