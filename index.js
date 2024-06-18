import express from "express";
import ejs from "ejs";
import pg from "pg";
import bodyParser from "body-parser";


const app= express();

app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static("public"));
app.use(express.json());



const db=new pg.Client({
    user: "postgres",
    password:"Tiku2004###",
    host:"localhost",
    port:5432,
    database:"Bill",
  });

db.connect();

async function customers(){
    const result=await db.query("SELECT customer_id,customer_name FROM customer_info");
    return result.rows;
}

async function date_now(){
    let now = new Date();
    let day = String(now.getDate()).padStart(2, '0');
    let month = String(now.getMonth() + 1).padStart(2, '0'); // Months are zero-based
    let year = now.getFullYear();
    let formattedDate = `${day}/${month}/${year}`;
    return formattedDate;
}

app.get("/",(req,res)=>{
    res.render("index.ejs");
});

app.get("/customer",(req,res)=>{
    res.render("customer.ejs");
});
app.get("/air_ticket",async (req,res)=>{
    const customer= await customers();
    res.render("air_ticket.ejs",{customer:customer});
}); 
app.get("/hotel_booking", async(req,res)=>{
    const customer= await customers();
    res.render("hotel_booking.ejs",{customer:customer});
});

app.get("/preprebill",async(req,res)=>{
    const customer= await customers();
    res.render("preprebill.ejs",{customer:customer});
});

let currentbillno=0;
let currentbillerid=0;
let currentbillername="";
let choice=0;
let date="";

app.post("/addcustomer",async (req,res)=>{
    const name=req.body.customer_name;
    const address=req.body.customer_address;
    const gstin=req.body.customer_gstin;
    const state=req.body.customer_state;
    const code=req.body.customer_code;

    try{
        const result=await db.query("INSERT INTO customer_info(customer_name,customer_address,customer_state,customer_state_code,customer_gstin) values ($1,$2,$3,$4,$5) RETURNING *;",[name,address,state,code,gstin]);
        console.log(result.rows[0]);
        console.log(result.rows[0].customer_name);
        res.render("customer.ejs",{name:result.rows[0].customer_name,address:result.rows[0].customer_address,state:result.rows[0].customer_state,code:result.rows[0].customer_state_code,gstin:result.rows[0].customer_gstin});
    }
    catch (err){
        console.log(err);
    }
})
app.post("/addticket",async (req,res)=>{
    const flight_number=req.body.flight_number;
    const flight_date=req.body.flight_date;
    const flight_time=req.body.flight_time;
    const flight_pnr=req.body.flight_pnr;
    const flight_travel_location=req.body.flight_travel_location;
    const air_ticket_customer_name=req.body.air_ticket_customer_name;
    const air_ticket_biller_id=req.body.air_ticket_biller_id;
    const flight_quantity=req.body.flight_quantity;
    const flight_rate=req.body.flight_rate;
    const flight_sac_code=req.body.flight_sac_code;
    const customer= await customers();


    try{
        const result=await db.query("INSERT INTO air_ticket(flight_number,flight_date,flight_time,flight_pnr,flight_travel_location,air_ticket_customer_name,air_ticket_biller_id,flight_quantity,flight_rate,flight_sac_code) values ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10) RETURNING *;",[flight_number,flight_date,flight_time,flight_pnr,flight_travel_location,air_ticket_customer_name,air_ticket_biller_id,flight_quantity,flight_rate,flight_sac_code]);

        res.render("air_ticket.ejs",
            {number:result.rows[0].flight_number ,
                 date:result.rows[0].flight_date ,
                 time:result.rows[0].flight_time ,
                 pnr:result.rows[0].flight_pnr,
                 location:result.rows[0].flight_travel_location,
                 name:result.rows[0].air_ticket_customer_name,
                 customer:customer,
                quantity:result.rows[0].flight_quantity,
                rate:result.rows[0].flight_rate,
                sac_code:result.rows[0].flight_sac_code});
    }
    catch (err){
        console.log(err);
    }
})
app.post("/addhotelbooking",async (req,res)=>{
    const hotel_booking_customer_name=req.body.hotel_booking_customer_name;
    const hotel_name=req.body.hotel_name;
    const hotel_location=req.body.hotel_location;
    const hotel_nights=req.body.hotel_nights;
    const hotel_check_in_date=req.body.hotel_check_in_date;
    const hotel_check_out_date=req.body.hotel_check_out_date;
    const hotel_booking_biller_id=req.body.hotel_booking_biller_id;
    const hotel_quantity=req.body.hotel_quantity;
    const hotel_rate=req.body.hotel_rate;
    const hotel_sac_code=req.body.hotel_sac_code;
    const customer= await customers();


    try{
        const result=await db.query("INSERT INTO hotel_booking(hotel_booking_customer_name,hotel_name,hotel_location,hotel_nights,hotel_check_in_date,hotel_check_out_date,hotel_booking_biller_id,hotel_quantity,hotel_rate,hotel_sac_code) values ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10) RETURNING *;",[hotel_booking_customer_name,hotel_name,hotel_location,hotel_nights,hotel_check_in_date,hotel_check_out_date,hotel_booking_biller_id,hotel_quantity,hotel_rate,hotel_sac_code]);

        res.render("hotel_booking.ejs",
            {name:result.rows[0].hotel_booking_customer_name ,
                 hotel_name:result.rows[0].hotel_name ,
                 hotel_location:result.rows[0].hotel_location ,
                 hotel_nights:result.rows[0].hotel_nights,
                 hotel_check_in_date:result.rows[0].hotel_check_in_date,
                 hotel_check_out_date:result.rows[0].hotel_check_out_date,
                 customer:customer,
                quantity:result.rows[0].hotel_quantity,
                rate:result.rows[0].hotel_rate,
                sac_code:result.rows[0].hotel_sac_code});
    }
    catch (err){
        console.log(err);
    }
})


app.post("/prebill",async(req,res)=>{
    currentbillno=req.body.bill_id;
    currentbillerid=req.body.customer_id;
    choice=req.body.choice;

    date = await date_now();

    let result2=await db.query("Insert into bill_info(bill_id,bill_customer_id,bill_date) values($1,$2,$3)",[currentbillno,currentbillerid,date]);
    currentbillername=await db.query("SELECT customer_name FROM customer_info WHERE customer_id=$1",[currentbillerid]);
    if(choice==1){
        let current_air_tickets=await db.query("SELECT * FROM air_ticket WHERE air_ticket_biller_id=$1 AND air_ticket_bill_id is NULL",[currentbillerid]);
        res.render("prebill_air_ticket.ejs",{bill_id:currentbillno,customer_name:currentbillername.rows[0].customer_name,air_ticket:current_air_tickets.rows});
        
    }
    else if(choice==2){
        let current_hotel_booking=await db.query("SELECT * FROM hotel_booking WHERE hotel_booking_biller_id=$1 AND hotel_booking_bill_id is NULL",[currentbillerid]);
        console.log("/prebill current hotel booking",current_hotel_booking.rows);
        res.render("prebill_hotel.ejs",{bill_id:currentbillno,customer_name:currentbillername.rows[0].customer_name,hotel_booking:current_hotel_booking.rows});
    }
})

app.post("/bill_hotel",async (req,res)=>{
    let selected_hotel_bookings = [];
    let service_charge_quantity = req.body.service_charge_quantity;
    let service_charge_rate = req.body.service_charge_rate;
    let sac_code = parseInt(req.body.sac_code_original);

    let service_charge = parseInt(service_charge_quantity) * parseInt(service_charge_rate);
    let original_selected_bookings=req.body.selected_bookings;
    console.log("original selected bookings",typeof(original_selected_bookings));

    console.log("1");
    console.log("service charge",service_charge);
    console.log("currentbillno",currentbillno);
    await db.query("UPDATE bill_info SET bill_service_charge = $1 WHERE bill_id = $2;",[parseInt(service_charge),parseInt(currentbillno)]);
    console.log("2");

    console.log("/bill_hotel hotel_booking",original_selected_bookings);

    if(typeof(original_selected_bookings)=='string'){
        let ticket=parseInt(original_selected_bookings);
        selected_hotel_bookings.push(ticket);
    }
    else{
        for(let j=0;j<original_selected_bookings.length;j++){
            
            let ticket=parseInt(original_selected_bookings[j]);
            
            selected_hotel_bookings.push(ticket);
        };
    }


    console.log("/bill_hotel selected hotel bookings",selected_hotel_bookings);

    console.log("/bill_hotel sac code",sac_code);


    selected_hotel_bookings.forEach((ticket1)=>{
        ticket1=parseInt(ticket1);
        let query_2345=db.query("UPDATE hotel_booking SET hotel_booking_biller_id=$1,hotel_booking_bill_id=$2 WHERE hotel_booking_id=$3",[currentbillerid,currentbillno,ticket1]);
    });

    let query1="SELECT * FROM hotel_booking WHERE hotel_booking_id IN";
    let where_value1="";

    for(let i=0;i<=selected_hotel_bookings.length+1;i++){
        if(i==0){
            where_value1+="(";
        }
        else if(i==selected_hotel_bookings.length+1){
            where_value1+=");";
        }
        else{
            if(i==selected_hotel_bookings.length){
                where_value1+="$"+i;
            }
            else{
                where_value1+="$"+i+",";
            }
        }      
    }
    console.log("/bill_hotel where value",where_value1);
    query1+=where_value1;
    console.log("/bill_hotel query1",query1);

    let final_hotel_booking= await db.query(`${query1}`,selected_hotel_bookings);
    console.log("/bill_hotel final hotel booking",final_hotel_booking.rows);


    let current_customer=await db.query("SELECT * FROM customer_info WHERE customer_id=$1",[currentbillerid]);
    console.log("/bill_hotel current customer",current_customer.rows[0]);
    res.render("bill_hotel.ejs",{final_final_hotel_booking:final_hotel_booking.rows,
        customer:current_customer.rows[0],
        sno:1,
        billno:currentbillno,
        date:date,
        final_sac_code:sac_code,
        final_service_charge:service_charge,
        final_service_charge_quantity:service_charge_quantity,
        final_service_charge_rate:service_charge_rate});
});
    
app.post("/bill_air",async(req,res)=>{
        
    let selected_air_ticket=[];
    let service_charge_quantity=req.body.service_charge_quantity;
    let service_charge_rate=req.body.bill_service_charge;
    let service_charge=parseInt(service_charge_quantity)*parseInt(service_charge_rate);
    let original_selected_bookings=req.body.air_tickets;
    console.log("service charge",service_charge);

    console.log("original selected bookings",original_selected_bookings);
    let result3 = await db.query("Insert into bill_info(bill_service_charge) values($1)",[service_charge]);
    if(typeof(original_selected_bookings)=='string'){
        let ticket=parseInt(original_selected_bookings);
        selected_air_ticket.push(ticket);
    }
    else{
        for(let j=0;j<original_selected_bookings.length;j++){
            
            let ticket=parseInt(original_selected_bookings[j]);
            
            selected_air_ticket.push(ticket);
        };
    }
    
    selected_air_ticket.forEach((ticket)=>{
        ticket=parseInt(ticket);
        let query_1234=db.query("UPDATE air_ticket SET air_ticket_biller_id=$1,air_ticket_bill_id=$2 WHERE air_ticket_id=$3",[currentbillerid,currentbillno,ticket]);
    })
    let query2="SELECT * FROM air_ticket WHERE air_ticket_id IN";
    let where_value2="";
    for(let i=0;i<=selected_air_ticket.length+1;i++){
        if(i==0){
            where_value2+="(";
        }
        else if(i==selected_air_ticket.length+1){
            where_value2+=");";
        }
        else{
            if(i==selected_air_ticket.length){
                where_value2+="$"+i;
            }
            else{
                where_value2+="$"+i+",";
            }
        }      
    }
    query2+=where_value2;
        
    let current_customer=await db.query("SELECT * FROM customer_info WHERE customer_id=$1",[currentbillerid]);

    let final_air_ticket= await db.query(`${query2}`,selected_air_ticket);
    res.render("bill_air_ticket.ejs",{air_ticket:final_air_ticket.rows,
            customer:current_customer.rows[0],
            sno:1,
            billno:currentbillno,
            date:date,
            service_charge:service_charge,
            service_charge_quantity:service_charge_quantity,
            service_charge_rate:service_charge_rate});
})

app.listen(3000,()=>{
    console.log("Server is running on port 3000");
})