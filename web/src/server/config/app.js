module.exports = {
	genres : ['Big band ', 'Christian/Gospel', 'Classical', 'Country ', 'EDM', 'Folk/bluegrass', 'Heavy Metal ', 'House music ', 'Indie Rock ', 'Jam Band Rock ', 'Jazz/Blues ', 'Latin', 'Opera', 'Punk Rock ', 'R&B', 'Rap/hip hop', 'Reggae', 'Rock', 'Seasonal ', 'Soul ', 'Techno', 'World'],
	venueTypes : ['Bar/Restaurant ','Café','Indoor','Indoor/Outdoor','Lounge','Outdoor','Private','Radio Station','Restaurant ','Rooftop ','Theatre'],
	actTypes : ['Band (Original Content)', 'Band (Cover)', 'Solo Acoustics', 'Solo Drummer', 'Solo Guitarist ', 'Solo Keyboardist', 'Solo Pianist ', 'Solo Violinist ', 'Solo Vocalist'],
	paymentTypes : ['Pay to play', 'Flat rate', 'Pre-sale tickets', '% of ticket sales', '% of bar sales', 'Donations', '% of ticket and bar sales'],
	ageRequirements : ['18 and over','21 and over','All ages'],
	states : ['Alabama','Alaska','Arizona','Arkansas','California', 'Colorado','Connecticut', 'Delaware','Florida','Georgia','Hawaii','Idaho','Illinois','Indiana','Iowa','Kansas','Kentucky','Louisiana','Maine','Maryland','Massachusetts','Michigan','Minnesota','Mississippi','Missouri','Montana','Nebraska','Nevada','New Hampshire','New Jersey', 'New Mexico' ,'New York','North Carolina','North Dakota','Ohio','Oklahoma','Oregon','Pennsylvania','Rhode Island','South Carolina','South Dakota','Tennessee','Texas','Utah','Vermont','Virginia','Washington','West Virginia','Wisconsin','Wyoming'],
	roles : {
		venueID : 1,
		artistID : 2,
		adminID : 3
	},
	roleID : [1, 2, 3],
	username : {
	   minLength: 5,
	   maxLength: 15
	},
	name : {
	   maxLength : 40
	},
	capacity : {
		min : 20,
		max : 10000
	},
	payrate : {
	   min: 0,
	   max: 600,
	   steps: 5,
	   value: [0, 50],
	},
	password : {
	   minLength : 5,
	   maxLength : 20
	},
 
	image : {
	   max_size : 3000000, 
	   min_size : 1000, 
	   file_type : ['image/jpeg', 'image/png'], 
	   type : ['logo', 'bandPhoto']  
	}, // valid image type=,
	status : ['ban', 'delete']
 };