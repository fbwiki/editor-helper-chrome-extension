fb-places-pro
=============

Plug-in to enhance the productivity of the fb places editor https://www.facebook.com/editor

This plug in puts the normal fb editor map inside a box to the right of the main editor.
It then adds controls to lookup the current editing node in bing. A more prominent "report" button is also added.

I would like to add reverse geocoding (getting the street address from the latitude and longitude
but (a) facebook buries those numbers in the "Edit" pop-up which gets loaded dynamically so it's
just a bit awkward to access and (b) you can't refer to scripts on other websites from a Chrome
extension which makes it annoying to load either the Google or Bing maps API.

The point of reverse geocoding of course would be to let you know if the map pin and listed
address for the node match (which they frequently don't).

Another to-do is to make moving the map pin easier. This is buried under the edit box and is
way too small for my taste.

MIT License.
