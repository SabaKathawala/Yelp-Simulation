$(document).ready(function($) {
    "use strict"; // Start of use strict
    navigator.geolocation.getCurrentPosition(function (position) {
    });
    let geo_options = {
        enableHighAccuracy: true,
        maximumAge: 30000,
        timeout: 27000
    };

// Search Functionality
$('#submit_search_query').click(function (event) {
    event.preventDefault();
    let text_value = $('#restaurant_search')[0].value;
    let max_distance = $('#max_distance')[0].value;
    let data = {'search_string': text_value};
    if(!text_value || text_value === '') {
        alert("Input a restaurant");
        return;
    }
    if(max_distance && (max_distance !== '' && isNaN(max_distance))) {
        alert("Distance needs to be a number");
        return;
    }
    function geo_success(position) {
        data['latitude'] = position.coords.latitude;
        data['longitude'] = position.coords.longitude;
        data['max_distance'] = max_distance;
        sendRequest();
    }

    function geo_error() {
        alert("Sorry, no position available.");
        sendRequest();
    }
    navigator.geolocation.getCurrentPosition(geo_success, geo_error, geo_options);
    function sendRequest() {
        $.ajax({
            type: "GET",
            url: "/backend/search",
            data: data,
        }).done(function (data) {
            let search_results = $('#search_results');
            search_results.empty();
            let index = 1;
            data.forEach(function (post) {
                let container_string = "<div class='container'>";
                let row_string = "<div class='row'>";
                let col_string = "<div class='col-sm-4'>";
                let full_col_string = "<div class='col'>";
                let container = $(container_string);
                //Appending the search result divider
                if(index++ !== 1) {
                    container.append($("<hr>"));
                }
                let row1 = $(row_string);
                let row2 = $(row_string);
                let row3 = $(row_string);
                let name = $(col_string);
                let name_tag = $("<a>");
                let city = $(col_string);
                let stars = $(col_string);
                let review_count = $(col_string);
                let distance = $(col_string);
                let is_open = $(col_string);
                let address = $(full_col_string);
                console.log(post);

                name_tag.text(post.name);
                name_tag.attr('name','restaurant page');
                name_tag.attr('href',"restaurant.html?id=" + post.id);
                name_tag.attr('id',post.id + "restaurant_link");
                name.append(name_tag);

                city.text(post.city);
                for (let index = 0; index < post.stars; index++) {
                    stars.append($("<i class='fa fa-star'></i>")).css("color", "orange");
                }
                for (let index = 0; index < 5 - post.stars; index++) {
                    stars.append($("<i class='fa fa-star-o'></i>")).css("color", "orange");
                }
                // stars.text(post.stars);
                let distance_value = post.distance !== null ? post.distance.toFixed(2) : "-";
                distance.text("Distance : " + distance_value);
                review_count.text("Review Count : " + post.review_count);
                address.text(post.address);
                is_open.text(post.is_open === 1 ? "Open" : "Closed");
                row1.append(name);
                row1.append(city);
                row1.append(distance);
                row2.append(stars);
                row2.append(review_count);
                // row2.append(is_open);
                row3.append(address);
                container.append(row1);
                container.append(row2);
                container.append(row3);
                search_results.append(container);
            });
            if(index === 1) {
                let message = $("<div class=\"alert alert-danger\">\n" +
                    "  <strong>No Results Found</strong> Try a different restaurant or larger distance" +
                    "</div>");
                search_results.append(message);
            }
        });
    }
});

$('#writeReview').click(function (event) {
    event.preventDefault();
    let username = $('#reg_Name').val();
    let password = $('#reg_Password').val();
    let email= $('#reg_Email').val();
    $.ajax({
        type: "POST",
        url: "/backend/register",
        data: {
            "username": username,
            "password": password,
            "email": email
        },
    }).done(function (post) {
        post = JSON.parse(post);
        if(post.status==="200") {
            $('#signUpModal').modal('hide');
            //window.location.reload();
            setisLoggedVisibilityStatus(true);
            $("#error").removeClass('active');
            $("#error").addClass('inactive');
        }
        if(post.message)
        {
            $("#error").text(post.message);
            $("#error").removeClass('inactive');
            $("#error").addClass('active');
        }
    });

});

$('#submit_login').click(function (event) {
        event.preventDefault();

        let email = $('#login_Email').val();
        let password = $('#login_Password').val();
        $.ajax({
            type: "POST",
            url: "/backend/login",
            data: {
                "email": email,
                "password": password
            },
        }).done(function (post) {
            debugger;
            post = JSON.parse(post);
            if(post.status==="200") {
                $('#loginModal').modal('hide');
                //window.location.reload();
                setisLoggedVisibilityStatus(true);
                $("#error2").addClass('inactive');
                $("#error2").removeClass('active');
            }
            if(post.message)
            {
                $("#error2").text(post.message);
                $("#error2").addClass('active');
                $("#error2").removeClass('inactive');
            }
        })
    });


//register functionality
$('#submit_register').click(function (event) {
        event.preventDefault();
        let username = $('#reg_Name').val();
        let password = $('#reg_Password').val();
        let email= $('#reg_Email').val();
        $.ajax({
            type: "POST",
            url: "/backend/register",
            data: {
                "username": username,
                "password": password,
                "email": email
            },
        }).done(function (post) {
            post = JSON.parse(post);
            if(post.status==="200") {
                $('#signUpModal').modal('hide');
                //window.location.reload();
                setisLoggedVisibilityStatus(true);
                $("#error").removeClass('active');
                $("#error").addClass('inactive');
            }
            if(post.message)
            {
                $("#error").text(post.message);
                $("#error").removeClass('inactive');
                $("#error").addClass('active');
            }
        });

    });


$("#logout").on("click", function (event) {
        $.ajax({
            type: "GET",
            url: "/backend/logout",
        })
        setisLoggedVisibilityStatus(false);
        //window.location.reload();
    });

$.ajax({
    type: "GET",
    url: "/backend/init",
}).done(function (data) {
    data = JSON.parse(data);
    setisLoggedVisibilityStatus(data.loggedIn);
    $('.welcome').text( "Welcome: " + data.user);
});

function setisLoggedVisibilityStatus(isLoggedIn) {
    //Removing all previous settings
    $("#loggedIn").removeClass('active');
    $("#loggedIn").removeClass('inactive');
    $("#notLogged").removeClass('active');
    $("#notLogged").removeClass('inactive');

    if(isLoggedIn === true) {
        $("#loggedIn").addClass("active");
        $("#notLogged").addClass('inactive');
        }
    else {
        $("#loggedIn").addClass("inactive");
        $("#notLogged").addClass('active');
    }
}
});