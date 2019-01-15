function hasValue(list){
  if (typeof list === 'array')
    return (list && list.length > 0);
  else
    return (list==null)?false:true;
}

function hasArtistCompletedStep1(artist){
  if(artist === null)
    return false;

  return (hasValue(artist.genres) &&
    hasValue(artist.actTypes) &&
    hasValue(artist.name) &&
    hasValue(artist.zipCode) &&
    hasValue(artist.phoneNumber) &&
    hasValue(artist.youtube));
}

function hasTargetUploadedPhoto(target){
  if(target === null)
    return false;
  
  return hasValue(target.assets);
}

function hasVenueCompletedStep1(venue){
  if(venue === null)
    return false;
  
  return (hasValue(venue.name) &&
    hasValue(venue.actTypes) &&
    hasValue(venue.venueTypes) &&
    hasValue(venue.genrePreferences) &&
    hasValue(venue.contactEmail) &&
    hasValue(venue.phoneNumber) &&
    // hasValue(venue.customerAge) &&
    hasValue(venue.capacity) &&
    hasValue(venue.addressLine1) &&
    hasValue(venue.city) &&
    hasValue(venue.region)); 
}


function getRedirectRoute(user, roles){
  if (user.roleID === roles.adminID) {
    return  "/admin";
  }

  if(!user.emailVerifiedTime){  // not email verfied(user account not created) go to email confirm page
    return "/emailConfirm";
  }
  
  if(user.roleID === roles.artistID) {
    if(user.artistID === null || !hasArtistCompletedStep1(user.artist))
      return "/signup/artist/step1"; 
    else if(!hasTargetUploadedPhoto(user.artist))
      return "/signup/artist/step2"; 
    else
      return "/venues";

  }
  if(user.roleID === roles.venueID) {
    if(user.venueID === null || !hasVenueCompletedStep1(user.venue))
      return "/signup/venue/step1"; 
    else if(!hasTargetUploadedPhoto(user.venue))
      return "/signup/venue/step2"; 
    else
      return "venues";
  }

  return "/venues";
}

module.exports = {
	getRedirectRoute
};