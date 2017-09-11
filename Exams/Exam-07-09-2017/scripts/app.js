function startApp() {

    const app = Sammy('#main', function () {
        this.use('Handlebars', 'hbs');

        $(document).on({
            ajaxStart: function () {
                $('#loadingBox').show();
            },
            ajaxStop: function () {
                $('#loadingBox').hide();
            }
        });

        //Home
        this.get('skeleton.html', displayHome);
        this.get('#/home', displayHome);

        function displayHome(context) {
            context.isLoggedIn = sessionStorage.getItem('username') !== null;
            context.username = sessionStorage.getItem('username');


            if (context.isLoggedIn) {


                chirpService.getChirpsByUsername(context.username)
                    .then(function (chirps) {

                        context.chirps = [];

                        if (chirps!==undefined){
                            for(let chirp of chirps){
                                debugger
                                let time=calcTime(chirp['_kmd']['ect']);
                                chirp.time=time
                            }

                            context.chirps=chirps;
                        }

                        context.loadPartials({
                            footer: './templates/common/footer.hbs',
                            header: './templates/common/header.hbs',
                            chirp: './templates/chirp/chirp.hbs',
                            home: './templates/home/home.hbs'
                        }).then(function () {
                            this.partial('./templates/home/homePage.hbs');
                        })

                    }).catch(auth.handleError);
            }
            else {
                context.loadPartials({
                    footer: './templates/common/footer.hbs',
                    header: './templates/common/header.hbs',
                    home: './templates/home/home.hbs'
                }).then(function () {
                    this.partial('./templates/home/homePage.hbs');
                })
            }
        }

        //Login
        this.get('#/login', displayHome);

        //Discover

        this.get('#/discover', function (context) {
            context.isLoggedIn = sessionStorage.getItem('username') !== null;
            context.username = sessionStorage.getItem('username');


            userService.getUsers()
                .then(function (users) {
                    //let users=[];

                    for (let user of users) {
                        user.notCurrentLoggedUser = context.username !== user['username'];
                        user.followers = 0;
                        if (user['subscriptions'] !== undefined && user['subscriptions'] !== null) {

                            user.followers = user['subscriptions'].length;
                        }

                    }

                    context.users = users

                    context.loadPartials({
                        footer: './templates/common/footer.hbs',
                        header: './templates/common/header.hbs',
                        user: './templates/discover/discoverUser.hbs'
                    }).then(function () {
                        this.partial('./templates/discover/discoverPage.hbs');
                    });
                }).catch(auth.handleError);
        });

        this.post('#/login', function (context) {
            let username = context.params.username;
            let password = context.params.password;

            auth.login(username, password)
                .then(function (userInfo) {
                    auth.showInfo('Login successful.');
                    auth.saveSession(userInfo);
                    displayHome(context);
                }).catch(auth.handleError)
        });

        //Register
        this.get('#/register', function (context) {
            context.isAnonymous = sessionStorage.getItem('username') === null;
            context.username = sessionStorage.getItem('username');
            context.loadPartials({
                footer: './templates/common/footer.hbs',
                header: './templates/common/header.hbs',
                registerForm: './templates/register/registerForm.hbs'
            }).then(function () {
                this.partial('./templates/register/registerPage.hbs');
            });
        });

        this.post('#/register', function (context) {
            let username = context.params.username;
            let password = context.params.password;
            let name = context.params.name;

            auth.register(username, password, name)
                .then(function (userInfo) {
                    auth.saveSession(userInfo);
                    auth.showInfo('User registered successfully');
                    displayHome(context)
                }).catch(handleError)
        });

        //Logout
        this.get('#/logout', function (context) {
            auth.logout()
                .then(function () {
                    sessionStorage.clear();
                    auth.showInfo('Logout successful.');
                    displayHome(context);
                }).catch(handleError)
        });

        this.post('#/chirp',function (context) {

            context.isLoggedIn = sessionStorage.getItem('username') !== null;
            context.username = sessionStorage.getItem('username');

            let text=$('.chirp-input').val()
            let data={
                "text": `${text}`,
                "author": `${context.username}`
            }

            chirpService.createChirp(data)
                .then(function () {
                    auth.showInfo('Chirp.');
                    displayHome(context);
                })
                .catch(auth.handleError)

        })


        function calcTime(dateIsoFormat) {
            let diff = new Date - (new Date(dateIsoFormat));
            diff = Math.floor(diff / 60000);
            if (diff < 1) return 'less than a minute';
            if (diff < 60) return diff + ' minute' + pluralize(diff);
            diff = Math.floor(diff / 60);
            if (diff < 24) return diff + ' hour' + pluralize(diff);
            diff = Math.floor(diff / 24);
            if (diff < 30) return diff + ' day' + pluralize(diff);
            diff = Math.floor(diff / 30);
            if (diff < 12) return diff + ' month' + pluralize(diff);
            diff = Math.floor(diff / 12);
            return diff + ' year' + pluralize(diff);
            function pluralize(value) {if (value !== 1) return 's';
            else return '';
            }
        }


    });

    app.run();
}