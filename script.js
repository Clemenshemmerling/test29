$(function() {
   const poolData = {
      UserPoolId : _config.cognito.userPoolId, // Your user pool id here
      ClientId : _config.cognito.clientId // Your client id here
   };
   
   const userPool = new AmazonCognitoIdentity.CognitoUserPool(poolData);

   let code;
   let username;
   let password;

   $(".input input").focus(function() {

      $(this).parent(".input").each(function() {
         $("label", this).css({
            "line-height": "18px",
            "font-size": "15px",
            "font-weight": "100",
            "top": "0px"
         })
         $(".spin", this).css({
            "width": "100%"
         })
      });
   }).blur(function() {
      $(".spin").css({
         "width": "0px"
      })
      if ($(this).val() == "") {
         $(this).parent(".input").each(function() {
            $("label", this).css({
               "line-height": "60px",
               "font-size": "15px",
               "font-weight": "300",
               "top": "10px"
            })
         });

      }
   });

   $(".button").click(function(e) {
      var pX = e.pageX,
         pY = e.pageY,
         oX = parseInt($(this).offset().left),
         oY = parseInt($(this).offset().top);

      $(this).append('<span class="click-efect x-' + oX + ' y-' + oY + '" style="margin-left:' + (pX - oX) + 'px;margin-top:' + (pY - oY) + 'px;"></span>')
      $('.x-' + oX + '.y-' + oY + '').animate({
         "width": "500px",
         "height": "500px",
         "top": "-250px",
         "left": "-250px",

      }, 600);
      $("button", this).addClass('active');
   })

   $(".alt-2").click(function() {
      if (!$(this).hasClass('material-button')) {
         $(".shape").css({
            "width": "100%",
            "height": "100%",
            "transform": "rotate(0deg)"
         })

         setTimeout(function() {
            $(".overbox").css({
               "overflow": "initial"
            })
         }, 600)

         $(this).animate({
            "width": "100px",
            "height": "100px"
         }, 500, function() {
            $(".box").removeClass("back");

            $(this).removeClass('active')
         });

         $(".overbox .title").fadeOut(300);
         $(".overbox .input").fadeOut(300);
         $(".overbox .button").fadeOut(300);

         $(".alt-2").addClass('material-buton');
      }

   })

   $(".material-button").click(function() {

      if ($(this).hasClass('material-button')) {
         setTimeout(function() {
            $(".overbox").css({
               "overflow": "hidden"
            })
            $(".box").addClass("back");
         }, 200)
         $(this).addClass('active').animate({
            "width": "700px",
            "height": "700px"
         });

         setTimeout(function() {
            $(".shape").css({
               "width": "60%",
               "height": "50%",
               "transform": "rotate(45deg)"
            })

            $(".overbox .title").fadeIn(300);
            $(".overbox .input").fadeIn(300);
            $(".overbox .button").fadeIn(300);
         }, 700)

         $(this).removeClass('material-button');

      }

      if ($(".alt-2").hasClass('material-buton')) {
         $(".alt-2").removeClass('material-buton');
         $(".alt-2").addClass('material-button');
      }

   });

   $("#regbtn").click(function() {
      username = $("#regname").val();
      password = $("#regpass").val();
      userPool.signUp(username, password, null, null, function(err, result) { 
         if (err) {
            alert(err.message || JSON.stringify(err));
            return;
         }
         cognitoUser = result.user;
         localStorage.setItem('message', 'Welcome ' + cognitoUser.getUsername());
         $(".form-ctn").hide();
         $(".confirmbox").show();
      });
      $(".form-ctn").hide();
      $(".confirmbox").show();
   });

   $("#conbtn").click(function() {
      code = $("#concode").val();

      const userData = {
         Username : username,
         Pool : userPool
      };

      const cognitoUser = new AmazonCognitoIdentity.CognitoUser(userData);
   
      cognitoUser.confirmRegistration(code, true, function(err, result) {
         if (err) {
             alert(err);
             return;
         }
         console.log('call result: ' + result);
      });     
   });

   $("#login").click(function() {
      username = $("#name").val();
      password = $("#pass").val();

      const userData = {
         Username : username,
         Pool : userPool
      };

      const authenticationData = {
         Username : username,
         Password : password
      }

      const authenticationDetails = new AmazonCognitoIdentity.AuthenticationDetails(authenticationData);

      const cognitoUser = new AmazonCognitoIdentity.CognitoUser(userData);

      cognitoUser.authenticateUser(authenticationDetails, {
         onSuccess: function (result) {
            const accessToken = result.getIdToken().getJwtToken();
            localStorage.setItem("accessToken", accessToken);
            window.location.href = 'home.html';	
         },
 
         onFailure: function(err) {
            alert(err.message || JSON.stringify(err));
         }
      });
   });

   $( document ).ready(function() {
      if (window.location.pathname === "/home.html") {
         const message = localStorage.getItem("message");
         $( ".card-title" ).append( `${message}` );
         console.log(message)
      }
   });

   $("#invoke").click(() => {
      const token = localStorage.getItem("accessToken");
      const config = {
         method: 'post',
         url: _config.api.invokeUrl,
         headers: { 
            'Authorization': token,
            'Access-Control-Allow-Origin' : '*',
            'Access-Control-Allow-Methods' : 'GET,PUT,POST,DELETE,PATCH,OPTIONS',
         }
      };

      axios(config)
         .then(function (response) {
            console.log(JSON.stringify(response.data));
         })
         .catch(function (error) {
            console.log(error);
         });

   });

});
