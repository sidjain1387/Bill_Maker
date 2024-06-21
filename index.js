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
    const result=await db.query("SELECT customer_id,customer_name FROM customer_info order by customer_id desc;");
    return result.rows;
}

async function date_now() {
    let now = new Date();
    let day = String(now.getDate()).padStart(2, '0');
    let month = String(now.getMonth() + 1).padStart(2, '0');
    let year = now.getFullYear();
    let formattedDate = `${year}-${month}-${day}`;
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

app.get("/selected_bill_list",async(req,res)=>{
    let all_customers=await db.query("SELECT * FROM customer_info order by customer_id;");
    let bill_status=2;
    res.render("bill_list.ejs",{customers:all_customers.rows,bill_status:bill_status});
})




app.get("/customer_list",async (req,res)=>{
    let customers=await db.query("SELECT * FROM customer_info order by customer_id desc;");
    res.render("customer_list.ejs",{customer:customers.rows});
})

app.get("/delete_customer",async(req,res)=>{
    let customers=await db.query("SELECT * FROM customer_info order by customer_id desc");
    let delete_cus=0;
    res.render("delete_customer.ejs",{customer:customers.rows,delete_cus:delete_cus});
})

app.get("/delete_air_ticket",async(req,res)=>{
    let air_tickets=await db.query("SELECT * FROM air_ticket order by air_ticket_id desc;");
    let delete_air=0;
    res.render("delete_air_ticket.ejs",{air_ticket:air_tickets.rows,delete_air:delete_air});
})

app.get("/air_ticket_list",async(req,res)=>{
    let air_ticket=await db.query("SELECT * FROM air_ticket order by air_ticket_id desc;");
    res.render("air_ticket_list.ejs",{air_ticket:air_ticket.rows});

})

app.get("/hotel_booking_list",async(req,res)=>{
    let hotel_booking=await db.query("SELECT * FROM hotel_booking order by hotel_booking_id desc;");
    res.render("hotel_booking_list.ejs",{hotel_booking:hotel_booking.rows});
})

app.get("/delete_hotel_booking",async(req,res)=>{
    let hotel_booking=await db.query("SELECT * FROM hotel_booking order by hotel_booking_id desc");
    let delete_hotel=0;

    res.render("delete_hotel_booking.ejs",{hotel_booking:hotel_booking.rows,delete_hotel:delete_hotel});
})

app.get("/delete_bill",async(req,res)=>{
    let bill=await db.query("SELECT * FROM bill_info order by bill_id desc");
    const customer= await customers();
    let delete_bill=0;
    res.render("delete_bill.ejs",{bill:bill.rows,customers:customer,delete_bill:delete_bill});
})




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

    let result2=await db.query("Insert into bill_info(bill_id,bill_customer_id,bill_date,bill_booking_type) values($1,$2,$3,$4)",[currentbillno,currentbillerid,date,choice]);
    currentbillername=await db.query("SELECT customer_name FROM customer_info WHERE customer_id=$1",[currentbillerid]);
    if(choice==1){
        let current_air_tickets=await db.query("SELECT * FROM air_ticket WHERE air_ticket_biller_id=$1 AND air_ticket_bill_id IS NULL",[currentbillerid]);
        res.render("prebill_air_ticket.ejs",{bill_id:currentbillno, customer_name:currentbillername.rows[0].customer_name, air_ticket:current_air_tickets.rows});
        
    }
    else if(choice==2){
        let current_hotel_booking=await db.query("SELECT * FROM hotel_booking WHERE hotel_booking_biller_id=$1 AND hotel_booking_bill_id IS NULL",[currentbillerid]);
        console.log("/prebill current hotel booking",current_hotel_booking.rows);
        res.render("prebill_hotel.ejs",{bill_id:currentbillno, customer_name:currentbillername.rows[0].customer_name, hotel_booking:current_hotel_booking.rows});
    }
})

app.post("/bill_hotel",async (req,res)=>{
    let selected_hotel_bookings = [];
    let service_charge_quantity = req.body.service_charge_quantity;
    let service_charge_rate = req.body.service_charge_rate;
    let sac_code = parseInt(req.body.sac_code_original);

    let service_charge = parseInt(service_charge_quantity) * parseInt(service_charge_rate);
    let original_selected_bookings=req.body.selected_bookings;

    
    await db.query("UPDATE bill_info SET bill_service_charge = $1 WHERE bill_id = $2;",[parseInt(service_charge),parseInt(currentbillno)]);
    await db.query("UPDATE bill_info SET bill_sac_code = $1 WHERE bill_id = $2;",[parseInt(sac_code),parseInt(currentbillno)]);
    await db.query("UPDATE bill_info SET bill_service_charge_quantity = $1 WHERE bill_id = $2;",[parseInt(service_charge_quantity),parseInt(currentbillno)]);
    await db.query("UPDATE bill_info SET bill_service_charge_rate = $1 WHERE bill_id = $2;",[parseInt(service_charge_rate),parseInt(currentbillno)]);


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
    query1+=where_value1;

    let final_hotel_booking= await db.query(`${query1}`,selected_hotel_bookings);


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
    let sac_code=parseInt(req.body.sac_code_original);


    await db.query("UPDATE bill_info SET bill_service_charge = $1 WHERE bill_id = $2;",[parseInt(service_charge),parseInt(currentbillno)]);
    await db.query("UPDATE bill_info SET bill_sac_code = $1 WHERE bill_id = $2;",[parseInt(sac_code),parseInt(currentbillno)]);
    await db.query("UPDATE bill_info SET bill_service_charge_quantity = $1 WHERE bill_id = $2;",[parseInt(service_charge_quantity),parseInt(currentbillno)]);
    await db.query("UPDATE bill_info SET bill_service_charge_rate = $1 WHERE bill_id = $2;",[parseInt(service_charge_rate),parseInt(currentbillno)]);

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
            final_service_charge:service_charge,
            final_service_charge_quantity:service_charge_quantity,
            final_service_charge_rate:service_charge_rate});
})



app.post("/delete_selected_biller",async(req,res)=>{
    let customer_id=req.body.customer_id;
    try{
        await db.query("DELETE FROM customer_info WHERE customer_id=$1;",[parseInt(customer_id)]);
        let customers=await db.query("SELECT * FROM customer_info order by customer_id desc;");
        res.render("delete_customer.ejs",{customer:customers.rows});
    }
    catch(err){
        let delete_cus=1;
        let customers=await db.query("SELECT * FROM customer_info order by customer_id desc;");
        res.render("delete_customer.ejs",{customer:customers.rows,delete_cus:delete_cus});
    }

})

app.post("/delete_selected_air_ticket",async(req,res)=>{
    let air_ticket_id=req.body.air_ticket_id;
    try{
        await db.query("DELETE FROM air_ticket WHERE air_ticket_id=$1;",[parseInt(air_ticket_id)]);
        let air_ticket=await db.query("SELECT * FROM air_ticket;");
        res.render("delete_air_ticket.ejs",{air_ticket:air_ticket.rows});
    }
    catch(err){
        let delete_air=1;
        let air_ticket=await db.query("SELECT * FROM air_ticket;");
        res.render("delete_air_ticket.ejs",{air_ticket:air_ticket.rows,delete_air:delete_air});
    }
})


app.post("/delete_selected_hotel_booking",async(req,res)=>{
    let hotel_booking_id=req.body.hotel_booking_id;
    try{
        await db.query("DELETE FROM hotel_booking WHERE hotel_booking_id=$1;",[parseInt(hotel_booking_id)]);
        let hotel_booking=await db.query("SELECT * FROM hotel_booking order by hotel_booking_id desc;");
        res.render("delete_hotel_booking.ejs",{hotel_booking:hotel_booking.rows});
    }
    catch(err){
        let delete_hotel=1;
        let hotel_booking=await db.query("SELECT * FROM hotel_booking order by hotel_booking_id desc;");
        res.render("delete_hotel_booking.ejs",{hotel_booking:hotel_booking.rows,delete_hotel:delete_hotel});
    }
})

app.post("/delete_selected_bill",async(req,res)=>{
    let bill_id=req.body.bill_id;
    const customer= await customers();
    try{
        await db.query("DELETE FROM bill_info WHERE bill_id=$1;",[parseInt(bill_id)]);
        let bill=await db.query("SELECT * FROM bill_info order by bill_id desc");
        res.render("delete_bill.ejs",{bill:bill.rows,customers:customer});
    }
    catch(err){
        let delete_hotel=1;
        let bill=await db.query("SELECT * FROM bill_info order by bill_id desc");
        res.render("delete_bill.ejs",{bill:bill.rows,customers:customer});
    }    
})

let selected_customer_id=0;
let date_from="";
let date_to="";

app.post("/final_selected_bill_list",async(req,res)=>{
    selected_customer_id=req.body.selected_customer_id;
    date_from=req.body.date_from;
    date_to=req.body.date_to;

    try{
        let bill_status=1;
        let bills=await db.query("SELECT * FROM bill_info where bill_customer_id=$1 and bill_date Between $2 and $3 order by bill_id desc;",[selected_customer_id,date_from,date_to]);
        let all_customers=await db.query("SELECT * FROM customer_info order by customer_id;");
        res.render("bill_list.ejs",{bill:bills.rows,customers:all_customers.rows,bill_status:bill_status});
    }catch(err){
        let bill_status=0;
        let all_customers=await db.query("SELECT * FROM customer_info order by customer_id;");
        res.render("bill_list.ejs",{customers:all_customers.rows,bill_status:bill_status});

    }
})

app.get("/return_final_selected_bill_list",async(req,res)=>{
    try{
        let bill_status=1;
        let bills=await db.query("SELECT * FROM bill_info where bill_customer_id=$1 and bill_date Between $2 and $3 order by bill_id desc;",[selected_customer_id,date_from,date_to]);
        let all_customers=await db.query("SELECT * FROM customer_info order by customer_id;");
        res.render("bill_list.ejs",{bill:bills.rows,customers:all_customers.rows,bill_status:bill_status});
    }catch(err){
        console.log(err);
        let bill_status=0;
        let all_customers=await db.query("SELECT * FROM customer_info order by customer_id;");
        res.render("bill_list.ejs",{customers:all_customers.rows,bill_status:bill_status});

    }
})

app.post("/selected_air_bill",async (req,res)=>{
    try{

        let selected_final_bill_id=req.body.bill_id;
        let final_bills=await db.query("select b.* from bill_info as b join customer_info as c on b.bill_customer_id=c.customer_id join air_ticket as a on a.air_ticket_bill_id=b.bill_id where bill_id=$1;",[selected_final_bill_id]);
        let final_air_ticket=await db.query("select a.* from bill_info as b join customer_info as c on b.bill_customer_id=c.customer_id join air_ticket as a on a.air_ticket_bill_id=b.bill_id where bill_id=$1;",[selected_final_bill_id]);
        let current_customer=await db.query("select c.* from bill_info as b join customer_info as c on b.bill_customer_id=c.customer_id join air_ticket as a on a.air_ticket_bill_id=b.bill_id where bill_id=$1;",[selected_final_bill_id]);
        
        res.render("bill_air_ticket.ejs",{air_ticket:final_air_ticket.rows,
            customer:current_customer.rows[0],
            sno:1,
            billno:selected_final_bill_id,
            date:final_bills.rows[0].bill_date.toLocaleDateString(),
            final_service_charge:final_bills.rows[0].bill_service_charge,
            final_service_charge_quantity:final_bills.rows[0].bill_service_charge_quantity,
            final_service_charge_rate:final_bills.rows[0].bill_service_charge_rate});
    }
    catch(err){
        let bill_status=0;
        let bills=await db.query("SELECT * FROM bill_info where bill_customer_id=$1 and bill_date Between $2 and $3 order by bill_id desc;",[selected_customer_id,date_from,date_to]);
        let all_customers=await db.query("SELECT * FROM customer_info");
        res.render("bill_list.ejs",{bill:bills.rows,customers:all_customers.rows,bill_status:bill_status});
    }

})

app.post("/selected_hotel_bill",async (req,res)=>{
    try{

        let selected_final_bill_id=req.body.bill_id;
        let final_bills=await db.query("select b.* from bill_info as b join customer_info as c on b.bill_customer_id=c.customer_id join hotel_booking as a on a.hotel_booking_bill_id=b.bill_id where bill_id=$1;",[selected_final_bill_id]);
        let final_hotel_booking=await db.query("select a.* from bill_info as b join customer_info as c on b.bill_customer_id=c.customer_id join hotel_booking as a on a.hotel_booking_bill_id=b.bill_id where bill_id=$1;",[selected_final_bill_id]);
        let current_customer=await db.query("select c.* from bill_info as b join customer_info as c on b.bill_customer_id=c.customer_id join hotel_booking as a on a.hotel_booking_bill_id=b.bill_id where bill_id=$1;",[selected_final_bill_id]);
        
        res.render("bill_hotel.ejs",{final_final_hotel_booking:final_hotel_booking.rows,
            customer:current_customer.rows[0],
            sno:1,
            billno:selected_final_bill_id,
            date:final_bills.rows[0].bill_date.toLocaleDateString(),
            final_sac_code:final_bills.rows[0].bill_sac_code,
            final_service_charge:final_bills.rows[0].bill_service_charge,
            final_service_charge_quantity:final_bills.rows[0].bill_service_charge_quantity,
            final_service_charge_rate:final_bills.rows[0].bill_service_charge_rate});
    }
    catch(err){
        let bill_status=0;
        let bills=await db.query("SELECT * FROM bill_info where bill_customer_id=$1 and bill_date Between $2 and $3 order by bill_id desc;",[selected_customer_id,date_from,date_to]);
        let all_customers=await db.query("SELECT * FROM customer_info");
        res.render("bill_list.ejs",{bill:bills.rows,customers:all_customers.rows,bill_status:bill_status});
    }
})

app.listen(3000,()=>{
    console.log("Server is running on port 3000");
})