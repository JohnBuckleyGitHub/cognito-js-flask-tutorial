var CognitoUserPool = AmazonCognitoIdentity.CognitoUserPool;
var CognitoUser = AmazonCognitoIdentity.CognitoUser;
// var AuthenticationDetails = AmazonCognitoIdentity.AuthenticationDetails;

var poolData = {
	UserPoolId : 'eu-west-2_kRH36JClU', // Your user pool id here
	ClientId : '5rhjmkq289jqca6enpse6c8972' // Your client id here
};

function displayMsg () {
    var x = document.getElementById('button_msg');
    console.log('sign in func');
    x.textContent = 'Console Display Pressed!';
}

// function signInOld () {
//     console.log('sign in func');
//     var username = $('#sign_in_username').val();
//     var password = $('#sign_in_password').val();

//     var authenticationData = {
//         Username : username,
//         Password : password,
//     };

//     var authenticationDetails = new AuthenticationDetails(authenticationData);
//     var userPool = new AWSCognito.CognitoIdentityServiceProvider.CognitoUserPool(poolData);

//     var userData = {
//         Username : username,
//         Pool : userPool
//     };

//     var cognitoUser = new CognitoUser(userData);
//     cognitoUser.authenticateUser(authenticationDetails, {
//         onSuccess: function (result) {
//             console.log('Reached onSuccess!');
//             window.location.href = "/welcome";
//         },

//         onFailure: function(err) {
//             console.log('authenitcation failure!');
//             alert(err);
//         }

//     });
// }

function signIn() {
    console.log('sign in func');
    var username = $('#sign_in_username').val();
    var password = $('#sign_in_password').val();
    var new_password = $('#new_password').val();

    var authenticationData = {
        Username : username,
        Password : password,
    };

    var authenticationDetails = new AmazonCognitoIdentity.AuthenticationDetails(authenticationData);

    var userPool = new AmazonCognitoIdentity.CognitoUserPool(poolData);
    var userData = {
        Username : username,
        Pool : userPool
    };
    var cognitoUser = new AmazonCognitoIdentity.CognitoUser(userData);
    cognitoUser.authenticateUser(authenticationDetails, {
        onSuccess: function (result) {
            console.log('Reached onSuccess!');
            var accessToken = result.getAccessToken().getJwtToken();
            /* Use the idToken for Logins Map when Federating User Pools with identity pools or when passing through an Authorization Header to an API Gateway Authorizer */
            var idToken = result.idToken.jwtToken;
        },

        onFailure: function(err) {
            console.log('authenitcation failure!');
            console.log('remove me later' + username + ' ' + password);
            alert(err);
        },

        newPasswordRequired: () => {
            cognitoUser.completeNewPasswordChallenge(
                new_password,
                {},
                {
                    onSuccess: (user) => {
                        console.log('success', user);
                    },
                    onFailure: (error) => {
                        console.log(error);
                    },
                },
            );
        }
    });
}

function register () {
    var username = $('#registration_username').val();
    var password = $('#registration_password').val();
    var email = $('#registration_email').val();

    var userPool = new CognitoUserPool(poolData);

    var attributeList = [];

    var dataEmail = {
        Name : 'email',
        Value : email
    };

    var attributeEmail = new AWSCognito.CognitoIdentityServiceProvider.CognitoUserAttribute(dataEmail);

    attributeList.push(attributeEmail);

    userPool.signUp(username, password, attributeList, null, function(err, result){
        if (err) {
            alert(err);
            return;
        }
        cognitoUser = result.user;
        console.log('user name is ' + cognitoUser.getUsername());
    });
}

function validate () {
    var username = $('#code_username').val();
    var code = $('#code_code').val();

    var userPool = new CognitoUserPool(poolData);

    var userData = {
        Username : username,
        Pool : userPool
    };

    var cognitoUser = new CognitoUser(userData);
    cognitoUser.confirmRegistration(code, true, function(err, result) {
        if (err) {
            alert(err);
            return;
        }
        console.log('call result: ' + result);
    });
}

function signOut () {
    var userPool = new CognitoUserPool(poolData);
    var cognitoUser = userPool.getCurrentUser();

    if (cognitoUser !== null) {
        cognitoUser.signOut();
    }
    window.location.href = "/";
}

function setWelcome () {
    var userPool = new CognitoUserPool(poolData);
    var cognitoUser = userPool.getCurrentUser();

    if (cognitoUser != null) {
        cognitoUser.getSession(function(err, session) {
            if (err) {
                alert(err);
                return;
            }
            console.log(cognitoUser.signInUserSession.accessToken.jwtToken);
            $('#username').html(cognitoUser.username);
        });
    }

    var url = "/api/protected_api";

    $.post(url, {'access_token':
        cognitoUser.signInUserSession.accessToken.jwtToken})
    .done(function (data) {
        $('#data_from_protected_api').html(data);
    });
}
