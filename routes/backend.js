let express = require('express');
let router = express.Router();
let mysql = require('mysql');
let config = require('../config.json');
let db = require('../db');
let dateformat = require('dateformat');

let connection = mysql.createConnection({
    host     : config.host,
    user     : config.user,
    password : config.password,
    database : config.database
});
let configData = {
    host     : config.host,
    user     : config.user,
    password : config.password,
    database : config.database
};


connection.connect();
/* Get the valid session data*/
router.get('/init', function(req, res){
    var loggedIn = (req.session && req.session.token);
    let username = loggedIn ? req.app.locals.token[req.session.token] : "";
    res.send(JSON.stringify({
        title: 'Home',
        user: username,
        loggedIn: !!loggedIn
    }));
});


let defaultLayout = [
    {
        name: "name",
        r_top: 0.09351145038167939,
        r_left: 0.20930232558139536
    },
    {
        name: "rating",
        r_top: 0.14885496183206107,
        r_left: 0.20930232558139536
    },
    {
        name: "address",
        r_top: 0.3816793893129771,
        r_left: 0.20930232558139536
    },
    {
        name: "open-hours",
        r_top: 0.5019083969465649,
        r_left: 0.20930232558139536
    },
    {
        name: "review",
        r_top: 0.7213740458015268,
        r_left: 0.20930232558139536
    }
];

let database = new db.Database(configData);
/* GET home page. */
router.get('/search', function(req, res, next) {
    let search = req.query.search_string;
    let longitude = req.query.longitude;
    let latitude = req.query.latitude;
    let max_distance = parseInt(req.query.max_distance);
    console.log(search);
    console.log(longitude);
    console.log(latitude);

    let defaultMaxDistance = 100000;
    if(!latitude || !longitude) {
        latitude = 0;
        longitude = 0;
        max_distance = defaultMaxDistance;
    }
    if(!max_distance) {
        max_distance = defaultMaxDistance;
    }
    let params = [latitude, longitude, latitude, search, max_distance];
    let location_part = ' 69.0 * ' +
        'DEGREES( ACOS(COS(RADIANS(?)) ' +
        '* COS(RADIANS(latitude)) ' +
        '* COS(RADIANS(longitude) - RADIANS(?)) ' +
        '+ SIN(RADIANS(?)) * SIN(RADIANS(latitude))))' +
        'AS distance ';
    console.log(params);
    let sql = 'select * from (select id, stars, review_count, is_open, name, city, address, ' + location_part + ' from business where is_restaurant = true and Match(name, neighborhood , address , city , state) against (?  IN NATURAL LANGUAGE MODE)) t where t.distance < ? limit 10;';
    console.log(sql);
    connection.query(sql, params, function (err, rows, fields) {
        if (err) throw err;
        if(rows)
            res.status(200).send(rows);
        else res.error("Unable to retrieve data");
    });
});

router.post('/login', function(req, res, next) {
    let params=[req.body.email,req.body.password];
    connection.query('SELECT * from user where email=? and pswd=SHA2(?,224)',params,function (err, rows, fields) {
        if (err)
        {
            console.log(err);

        }
        if (rows.length > 0) {
            console.log(rows[0]);
            var token = req.app.randtoken.generate(16);
            req.app.locals.token[token] = rows[0].id;
            req.session.token = token;
            res.send(JSON.stringify({status: '200'}));
        }
        if(rows.length==0)
            res.send(JSON.stringify({status:'403', message:'Invalid email or password!'}));
        });
});

router.post('/register', function(req, res, next) {
    var user_id= req.app.randtoken.generate(16);
    let params=[user_id,req.body.username,req.body.email,req.body.password];
    connection.query('INSERT into user(id,name,email,pswd) values(?,?,?,SHA2(?,224))',params,function (err, rows,fields) {
        if (err) {
            if(err.errno===1062){
                res.send(JSON.stringify({status:'1062', message:'Duplicate Username!'}));
            }
            else
                res.send(JSON.stringify({status:'403', message:'Oops!! Unable to add this user!'}));
        }
        else{
            if (rows) {
                var token = req.app.randtoken.generate(16);
                req.app.locals.token[token] = params[0];
                req.session.token = token;
                res.send(JSON.stringify({status: '200'}));
            }
        }
    });
});
router.get('/logout', function(req, res, next) {
    delete req.session.token;
    delete req.app.locals.token[0];
    res.send(JSON.stringify({status:'200'}));
});

/* GET page layout. */
router.get('/layout', function(req, res, next) {

    let params = [req.query.b_id];
    console.log(params);
    let layout, restaurant, hours, reviews;

    database.query( 'SELECT object_id as name, r_top, r_left, color from layout WHERE business_id = ? ORDER BY r_top', params )
        .then( rows => {
        console.log(rows);
    if(rows.length === 0) {
        layout = defaultLayout;
    } else {
        layout = Object.assign({}, defaultLayout, rows);
    }
    return database.query( 'SELECT * from business WHERE id = ?', params );
})
.then( rows => {
        console.log(rows[0].name);
    address = rows[0].address + ", " + rows[0].city + ", " + rows[0].state + ", " + rows[0].postal_code;
    restaurant = {
        name: rows[0].name,
        rating : rows[0].stars,
        location : {
            address : address,
            neighborhood: rows[0].neighborhood
        },
        is_open : rows[0].is_open
    };
    return database.query( 'SELECT hours from hours WHERE business_id = ?', params );
})
.then( rows => {
        console.log(rows);
    hours = rows[0];
    return database.query( 'SELECT u.name, u.review_count, u.yelping_since, u.fans, u.average_stars,' +
        'r.stars, r.date, r.text from review as r join user as u on r.user_id = u.id WHERE business_id = ? ORDER BY date DESC LIMIT 3', params );
})
.then( rows => {
        console.log(rows[0].yelping_since);
    reviews = [];
    for( i = 0; i < rows.length; i++) {
        let review_info = {
            user : {
                name: rows[i].name,
                u_rating: rows[i].average_stars,
                reviews: rows[i].review_count,
                date: dateformat(rows[i].yelping_since, "mmmm dS, yyyy"),
                fans: rows[i].fans
            },
            review : {
                r_rating: rows[i].stars,
                text: rows[i].text,
                date: dateformat(rows[i].date, "mmmm dS, yyyy")
            }
        }
        reviews.push(review_info);
    }

    var loggedIn = (req.session && req.session.token);
    let response = {
        layout: layout,
        restaurant : restaurant,
        open_hours : hours,
        reviews : reviews,
        loggedIn: !!loggedIn
    }
    console.log(layout);
    console.log(restaurant);
    console.log(hours);
    console.log(reviews);
    res.status(200).send(JSON.stringify(response));

});
});


router.post('/saveLayout', function (req, res, next) {
    console.log(JSON.parse(req.body.layout));
    let newStyles = JSON.parse(req.body.layout);
    if(findOverLaps(newStyles)){
        res.send(JSON.stringify({message:"Your elements are overlapping. Please adjust them to remove overlaps."}));
    }
    else {
        // let database = new db.Database(configData);
        let b_id = req.body.b_id;
        let params = [b_id];
        console.log(params);
        //check if business id exists
        database.query('SELECT id from business WHERE id = ? ', params)
            .then(rows => {
            console.log(rows);
        if (rows.length == 0) {
            res.send(JSON.stringify("We didn't change the layout for you. We know you don't exist :D"))
        }
        else {
            return database.query('SELECT * from layout WHERE business_id = ?', params);
        }
    }).
        then(rows => {
            console.log(rows);
        if(typeof rows !== undefined) {

            params = [];
            for (let i = 0; i < newStyles.length; i++) {
                params.push(b_id);
                params.push(newStyles[i].name);
                params.push(newStyles[i].r_left);
                params.push(newStyles[i].r_top);
                params.push(newStyles[i].font);
                params.push(newStyles[i].color);
            }
            return database.query('INSERT INTO layout (business_id, object_id, r_left, r_top, font, color) ' +
                'VALUES (?, ?, ?, ?, ?, ?), (?, ?, ?, ?, ?, ?),(?, ?, ?, ?, ?, ?), ' +
                '(?, ?, ?, ?, ?, ?), (?, ?, ?, ?, ?, ?) ' +
                'ON DUPLICATE KEY UPDATE ' +
                'r_left = VALUES(r_left), r_top = VALUES(r_top), ' +
                'font = VALUES(font), color = VALUES(color) ', params);
        }
    }).
        then(rows => {
            console.log(rows);
        res.status(200).send(JSON.stringify("Updated"));
    });
    }
});

function findOverLaps(newStyles) {
    for(let i = 0; i < newStyles.length-1; i++) {
        for(let j = i+1; j < newStyles.length; j++) {
            if(!(newStyles[i].x2 < newStyles[j].x1 ||
                    newStyles[i].x1 > newStyles[j].x2 ||
                    newStyles[i].y2 < newStyles[j].y1 ||
                    newStyles[i].y1 > newStyles[j].y2)) {
                return true;
            }
        }
    }
    return false;
}
router.post('/register', function(req, res, next) {
    var user_id= req.app.randtoken.generate(16);
    let params=[user_id,req.body.username,req.body.email,req.body.password];
    connection.query('INSERT into user(id,name,email,pswd) values(?,?,?,SHA2(?,224))',params,function (err, rows,fields) {
        if (err) {
            if(err.errno===1062){
                res.send(JSON.stringify({status:'1062', message:'Duplicate Username!'}));
            }
            else
                res.send(JSON.stringify({status:'403', message:'Oops!! Unable to add this user!'}));
        }
        else{
            if (rows) {
                var token = req.app.randtoken.generate(16);
                req.app.locals.token[token] = params[0];
                req.session.token = token;
                res.send(JSON.stringify({status: '200'}));
            }
        }
    });
});
router.get('/logout', function(req, res, next) {
    delete req.session.token;
    delete req.app.locals.token;
    res.send(JSON.stringify({status:'200'}));
});

router.post('/addreview', function(req, res, next) {
    let token = req.session.token;
    if(!token) res.status(403);
    let user_id= req.app.locals.token[token];
    let business_id = req.body.b_id;
    let stars = req.body.stars;
    let review = req.body.text;
    let params=[business_id + user_id, stars, review, business_id, user_id];
    let sql = "insert into review(id, stars, date, text, business_id, user_id) values (?, ?,NOW(),?,?,?)";
    console.log(params);
    connection.query(sql ,params,function (err, rows,fields) {
        if (err) {
            if(err.errno===1062){
                res.send(JSON.stringify({status:'1062', message:'Duplicate Review!'}));
            }
            else
                res.send(JSON.stringify({status:'403', message:'Oops!! Unable to add review!'}));
        }
        else{
            res.send(JSON.stringify({status: '200'}));
        }
    });
});

module.exports = router;