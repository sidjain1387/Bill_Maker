database name = Bill;

create table package_info(
package_id serial Primary key,
package_desc_1 text,
package_desc_2 text,
package_desc_3 text,
package_desc_4 text,
package_desc_5 text,
package_desc_6 text,
package_biller_id int,
package_bill_id int,
package_sac_code int,
package_quantity int,
package_rate int);

create table hotel_booking(
    hotel_booking_id serial Primary key,
    hotel_name text,
    hotel_location text,
    hotel_nights int,
    hotel_check_in_date text,
    hotel_check_out_date text,
    hotel_booking_biller_id int,
    hotel_booking_bill_id int,
    hotel_booking_customer_name text,
    hotel_quantity int,
    hotel_rate int,
    hotel_sac_code text
);


create table air_ticket(
    air_ticket_id serial Primary key,
    flight_number text,
    flight_date text,
    flight_time text,
    flight_pnr text,
    flight_travel_location text,
    air_ticket_biller_id int,
    air_ticket_bill_id int,
    air_ticket_customer_name text,
    flight_quantity int,
    flight_rate int,
    flight_sac_code text
);


create table bill_info(
    bill_id serial,
    bill_customer_id int,
    bill_date date,
    bill_service_charge int,
    bill_sac_code text,
    bill_booking_type text,
    bill_service_charge_rate text,
    bill_service_charge_quantity text
)

create table customer_info(
    customer_id serial Primary key,
    customer_name text,
    customer_address text,
    customer_state text,
    customer_state_code int,
    customer_gstin text
);