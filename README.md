# Restaurant_Reviews_Fsociety
Application which provides a platform to give and read reviews of restaurants

About the app.?
This is a restaurant search and review app. It enables you to search for a restaurant within a given distance.
It list the search results and has a landing page for each restaurant.

users can add reviews to the restaurant and see the ratings of each restaurant and customize the page.

Technology Used:

The app runs on node - express platform. It requires node v8.
The app runs on a VM provided by google cloud service.

The url is https://rreviews.uicbits.net

We use nginx to run the web server. And configured it to port forward traffic from
http and https ports to the node engine. The UI done using html/bootstrap/Jquery/JS.

The data is stored in an sql instance provided by google cloud services.
The data mostly is obtained from a sample dataset provided by Yelp.


a valid email/password would be 'akash', '123' for testing.

Security Concerns:
We were planning to implement an interface where the user could inject html to customize their website.
The primary concern was that, this could provide a lot of injection problems. Most of the typical xss injection filtering
libraries would filter out html as well. In our case, we needed to preserve the html and css without compromising the security.

Also, additional concerns were that the user could inject valid elements in technical sense but still could 
exploit the system. An example of this would be an user inputting valid html with review objects created 
by the user. These would be a valid operation as only html is injected as expected and would be more difficult to semantically
filter out these content.

As a result, we decided that its better to provide an interface with limited customization. So currently we provide options to
move an object along x/y axis. (One axis at a time). The color of the elements could be changed. We have used JQuery UI for this.

Helmet JS anWe were not able to enable and test the complete features provided by helmetJS. But we are able to run without any issues after integrating with the helmetJS xss filtering.
we are using parameterized sql queries. We are using sha256 encryption for storing passwords.

We use session management (express sessions) to verify the user. The business id could be inputted by the user and there are some vulnerablilities around this area.
  
Project Roles.
Akash Edacheril Johny: Did setting up the VM server and the cloud sql instance. Loaded the data. Did the restaurant search and add review options.

Saba kathawala : Created the code base. Did the Home page/Business landing page as well as the edit layout page.

Deepika Tripathi: Integrated the login/Registration flow.  Created and managed the database schemas and the express connection to the database. Added the session management code used throughout the application.

Chris : Had created the domain name and obtained the https certification for our server.

