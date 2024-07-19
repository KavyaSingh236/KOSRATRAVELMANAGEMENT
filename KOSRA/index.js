const express = require("express");
const path = require("path");
const { v4: uuidv4 } = require('uuid');
const bodyParser = require("body-parser");
const ejs = require('ejs');
const pdf = require('html-pdf');

const app = express();
const port = 3000;
app.use(express.static(path.join(__dirname, '/')));
app.use(express.static('public'));
app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "/views"));
app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));


function formatTime(time) {
    let [hours, minutes] = time.split(':');
    hours = parseInt(hours);
    let ampm = hours >= 12 ? 'PM' : 'AM';
    hours = hours % 12;
    hours = hours ? hours : 12; // the hour '0' should be '12'
    minutes = minutes.length < 2 ? '0' + minutes : minutes;
    return `${hours}:${minutes} ${ampm}`;
}

function formatDate(date) {
    if (!date) return "Invalid Date";
    const [year, month, day] = date.split('-');
    return `${day}-${month}-${year.slice(2)}`;
}

app.get('/again.html', (req, res) => {
    res.sendFile(path.join(__dirname, 'again.html'));
});
app.get("/book", (req, res) => {
    const { date, time, location } = req.query;
    const formattedTime = formatTime(time);
    const formattedDate = formatDate(date);
    let id = uuidv4();
    res.render("tablebooked.ejs", {
        id: id,
        date: formattedDate,
        time: formattedTime,
        location: location
    });
});

app.post('/downloadres-receipt', (req, res) => {
    const {id,date, time, location }= req.body;

    

    const receiptHtml = `
    <!DOCTYPE html>
    <html lang="en">
    <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Booking Receipt - Hotel Kosra</title>
        <style>
            @page {
                margin:30px;
            }
            * {
                padding: 0;
                margin: 0;
                font-family: sans-serif;
            }
            body {
                padding:5% 5%;
            }
            nav {
                display: flex;
                justify-content: space-between;
                margin-bottom: 10px;
            }
            .logo {
                display: flex;
            }
            .header {
                text-align: right;
                font-size: 2em;
                font-weight: 600;
            }
            li {
                margin-top: 5px;
                margin-bottom: 5px;
            }
            .col {
                -ms-flex-preferred-size: 0;
                flex-basis: 0;
                -ms-flex-positive: 1;
                flex-grow: 1;
                max-width: 100%;
            }
            table {
                margin-top: 0;
                width: 100%;
            }
            .table {
                margin-top: 25px;
            }
            tr {
                width: 100%;
            }
            th {
                width: 25%;
                text-align: left;
                padding: 5px 20px;
            }
            td {
                width: 25%;
                text-align: left;
                padding: 5px 15px;
            }
            caption {
                text-align: left;
                background-color: #a9a9a9;
                color: white;
                padding: 8px 15px;
                font-weight: bold;
            }
            .tr-caption {
                text-align: left;
                background-color: #a9a9a9;
                color: white;
                padding: 0;
                font-weight: bold;
                width: 100%;
                font-size: 1.4em;
            }
            .tr-even {
                background-color: #f0f0f0;
            }
            .tr-odd {
                background-color: white;
            }
        </style>
    </head>
    <body>
        <nav>
            <div class="col header" style="width: 50%;">
                <span style="color: rgb(225, 35, 35); font-weight: bold;">Reservation Confirmation</span>
            </div>
        </nav>
        <hr style="height: 1px; border: 0; background-color: grey;" noshade>
        <main style="padding: 10px;">
            <div style="margin: 15px auto;">
                <h3>Important Information</h3>
                <ul style="padding-left: 50px;">
                    Please bring this with you to the restaurant for easy walk-in access. It is recommended that you retain a copy for your records.
                    
                </ul>
            </div>
            <div class="table-div">
                <table class="table">
                    <tr class="tr-caption">
                        <td style="width: 100%;">BOOKING INFORMATION</td>
                    </tr>
                </table>
                <table cellspacing='0'>
                    <tr class="tr-even">
                        <th>BOOKING ID</th>
                        <td>${id}</td>
                    </tr>
                    <tr class="tr-odd">
                        <th>Date</th>
                        <td>${date}</td>
                        
                    </tr>
                    <tr class="tr-even">
                        <th>Location</th>
                        <td>${location}</td>
                    </tr>

                </table>
            </div>
            <br>
            <hr>
        </main>
        <p style="margin:40px 0; margin-left:350px;  font-size: .8em;">&#169; Hotel Kosra. All rights reserved.</p>
    </body>
    </html>
    `;

    const options = { format: 'A4' };

    pdf.create(receiptHtml, options).toStream((err, stream) => {
        if (err) {
            console.error("PDF creation error:", err);
            return res.status(500).send('Internal Server Error');
        }
        res.setHeader('Content-Type', 'application/pdf');
        res.setHeader('Content-Disposition', 'attachment; filename=kosratablebooking.pdf');
        stream.pipe(res);
    });
});


app.get("/hotel", (req, res) => {
    res.render("hotelbooking.ejs");
});

function getPricePerRoom(hotelType) {
    const prices = {
        standard:1500,
        deluxe: 2500,
        suite: 3500,
    };
    return prices[hotelType] || 0;
}

app.post('/book-hotel', (req, res) => {
    const { name, hotelType, adults, children, rooms, checkInDate, checkOutDate } = req.body;
    const formattedCheckInDate = formatDate(checkInDate);
    const formattedCheckOutDate = formatDate(checkOutDate);
    const pricePerRoom = getPricePerRoom(hotelType);
    const totalPrice = pricePerRoom * rooms;
    const advanceAmount = totalPrice * 0.4; // 40% of total price
    res.render('payment', {
        name,
        hotelType,
        adults,
        children,
        rooms,
        totalPrice,
        advanceAmount,
        formattedCheckInDate,
        formattedCheckOutDate
    });
});

app.post('/payment2', (req, res) => {
    const { name, hotelType, adults, children, rooms, formattedCheckInDate,
        formattedCheckOutDate } = req.body;
    const pricePerRoom = getPricePerRoom(hotelType);
    const totalPrice = pricePerRoom * rooms;
    const advanceAmount = totalPrice * 0.4;
    res.render('payment2.ejs', { 
        name,
        hotelType,
        adults,
        children,
        rooms,
        totalPrice,
        advanceAmount,
        formattedCheckInDate,
        formattedCheckOutDate 
    });
});
app.post('/paymentprocessing',(req,res)=>{
    const { name, hotelType, adults, children, rooms,totalPrice,advanceAmount,checkInDate ,checkOutDate } = req.body;

    res.render('paymentprocessing.ejs', { 
        name,
        hotelType,
        adults,
        children,
        rooms,
        totalPrice,
        advanceAmount,
        checkInDate ,checkOutDate
    });
});

app.post('/download-receipt', (req, res) => {
    const { name, hotelType, adults, children, rooms, checkInDate, checkOutDate, totalPrice, advanceAmount } = req.body;

    // Calculate the balance amount
    const balanceAmount = totalPrice - advanceAmount;
    

    const receiptHtml = `
    <!DOCTYPE html>
    <html lang="en">
    <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Booking Receipt - Hotel Kosra</title>
        <style>
            @page {
                margin:30px;
            }
            * {
                padding: 0;
                margin: 0;
                font-family: sans-serif;
            }
            body {
                padding:5% 5%;
            }
            nav {
                display: flex;
                justify-content: space-between;
                margin-bottom: 10px;
            }
            .logo {
                display: flex;
            }
            .header {
                text-align: right;
                font-size: 2em;
                font-weight: 600;
            }
            li {
                margin-top: 5px;
                margin-bottom: 5px;
            }
            .col {
                -ms-flex-preferred-size: 0;
                flex-basis: 0;
                -ms-flex-positive: 1;
                flex-grow: 1;
                max-width: 100%;
            }
            table {
                margin-top: 0;
                width: 100%;
            }
            .table {
                margin-top: 25px;
            }
            tr {
                width: 100%;
            }
            th {
                width: 25%;
                text-align: left;
                padding: 5px 20px;
            }
            td {
                width: 25%;
                text-align: left;
                padding: 5px 15px;
            }
            caption {
                text-align: left;
                background-color: #a9a9a9;
                color: white;
                padding: 8px 15px;
                font-weight: bold;
            }
            .tr-caption {
                text-align: left;
                background-color: #a9a9a9;
                color: white;
                padding: 0;
                font-weight: bold;
                width: 100%;
                font-size: 1.4em;
            }
            .tr-even {
                background-color: #f0f0f0;
            }
            .tr-odd {
                background-color: white;
            }
        </style>
    </head>
    <body>
        <nav>
            <div class="col header" style="width: 50%;">
                <span style="color: rgb(225, 35, 35); font-weight: bold;">Booking Confirmation</span>
            </div>
        </nav>
        <hr style="height: 1px; border: 0; background-color: grey;" noshade>
        <main style="padding: 10px;">
            <div style="margin: 15px auto;">
                <h3>Important Information</h3>
                <ul style="padding-left: 50px;">
                    <li>This is your E-Ticket Itinerary. You must bring it to the hotel for check-in, and it is recommended you retain a copy for your records.</li>
                    <li>Check-in time is 2:00 PM and check-out time is 12:00 PM. A valid ID proof is required at the time of check-in.</li>
                </ul>
            </div>
            <div class="table-div">
                <table class="table">
                    <tr class="tr-caption">
                        <td style="width: 100%;">BOOKING INFORMATION</td>
                    </tr>
                </table>
                <table cellspacing='0'>
                    <tr class="tr-even">
                        <th>HOTEL TYPE</th>
                        <td>${hotelType}</td>
                        <th>ADULTS</th>
                        <td>${adults}</td>
                    </tr>
                    <tr class="tr-odd">
                        <th>CHILDREN</th>
                        <td>${children}</td>
                        <th>ROOMS</th>
                        <td>${rooms}</td>
                    </tr>
                    <tr class="tr-even">
                        <th>CHECK-IN DATE</th>
                        <td>${checkInDate}</td>
                        <th>CHECK-OUT DATE</th>
                        <td>${checkOutDate}</td>
                    </tr>
                </table>
                <table class="table">
                    <tr class="tr-caption">
                        <td style="width: 100%;">PAYMENT DETAILS</td>
                    </tr>
                </table>
                <table cellspacing='0'>
                    <tr class="tr-odd">
                        <th>TOTAL PRICE</th>
                        <td>INR ${totalPrice}</td>
                    </tr>
                    <tr class="tr-even">
                        <th>ADVANCE AMOUNT PAID</th>
                        <td>INR ${advanceAmount}</td>
                    </tr>
                    <tr class="tr-odd">
                        <th>BALANCE TO BE PAID</th>
                        <td>INR ${balanceAmount}</td>
                    </tr>
                </table>
                <table class="table">
                    <tr class="tr-caption">
                        <td style="width: 100%;">TERMS AND CONDITIONS</td>
                    </tr>
                </table>
                <table cellspacing='0'>
                    <tr class="tr-odd">
                        <td style="width: 100%;">
                            <p>1. Check-in time is 2:00 PM and check-out time is 12:00 PM.</p>
                            <p>2. A valid ID proof is required at the time of check-in.</p>
                            <p>3. Cancellation policy applies.</p>
                            <p>4. Any damage to hotel property will be charged to the guest.</p>
                        </td>
                    </tr>
                </table>
            </div>
            <br>
            <hr>
        </main>
        <p style="margin:40px 0; margin-left:350px;  font-size: .8em;">&#169; Hotel Kosra. All rights reserved.</p>
    </body>
    </html>
    `;

    const options = { format: 'A4' };

    pdf.create(receiptHtml, options).toStream((err, stream) => {
        if (err) {
            console.error("PDF creation error:", err);
            return res.status(500).send('Internal Server Error');
        }
        res.setHeader('Content-Type', 'application/pdf');
        res.setHeader('Content-Disposition', 'attachment; filename=kosrahotelbooking.pdf');
        stream.pipe(res);
    });
});

app.listen(port, () => {
    console.log(`Server listening at ${port}`);
});
