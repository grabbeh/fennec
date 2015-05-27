
Fennec
==================

**Fennec** is a tool you can use to visualise and analyse your trade mark portfolio (on the assumption you have one!). You can also allow non-legal types (PR/design teams) to check whether you are registered in a particular country to allow them to use appropriate trade marks ('R'/'TM' etc). A working demo is [here](https://tryfennec.com).

Here's what the admin panel looks like:

![example](/client/images/screenshot.png)

As a preliminary step you will also need Node.js installed. Additionally, the app uses 

- **MongoDB** to store data, (so you'll need insert details at `/server/config/db.js`) 
- **Sendgrid** to send reminder emails so would require those details if you want to make use of the app, (details inserted at `/server/config/admin.js`) 
- **Elasticsearch** for search functionality
- an **Amazon S3** bucket to store images (key and secret will go in `/server/config/s3.js`) 
- **Mapbox** to show maps - you will need to insert your own id in the maps directive at `/client/views/map/map-directive.js`

To get a copy of the code on your system just `git clone https://github.com/grabbeh/fennec` and then in the home directory `npm install` to install the dependencies. Once the importing process has been completed, you can `node app` in the home directory and go to `http://localhost:2002` where you will be asked to create an account (this should be an admin account). From that point, you will be taken to `/select-portfolio` where you can surprisingly, select your portfolio for viewing.

To import trade marks you should create an account, then go to `/upload` to upload an .xlxs spreadsheet. This requires the columns to be in the following order at this moment in time so you should amend your portfolio as necessary (column headers don't actually matter, only the order):

    Country | Mark | Classes | Filing Date | App. No. | Reg. Date | Reg. No. | Status | Expiry Date

The code also assumes:

- dates are in MM/DD/YYYY format
- numbers in classes are comma separated
- for the purposes of analysis statuses have to be either "Registered", "Published" or "Pending".

Once import is successful, you can navigate to `/select-portfolio` to see your portfolio.

Please get in touch if you would like to know more about the functionality offered by the app or are interested in getting me to configure your portfolio for you.

**Third party code**

In addition to the packages listed in `package.json` use is also made of:

- https://github.com/mledoze/countries for the purposes of ISO codes and country coordinates. This is licensed under http://opendatacommons.org/licenses/odbl/1.0/. 
- Geojson for the world is from https://github.com/johan/world.geo.json.

