let userService=(()=> {

    function getUsers() {
        return requester.get('user','')
    }

    return {
        getUsers
    }
})();