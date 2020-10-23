# v1.2.1

- Moved the GSAP import to be a relative instead of absolute path, to allow for it to work with FoundryInstances running with the routePrefix option. 

# v1.2.0

- *FIX* Now using the new GSAP path introduced in FVTT 0.7.4
- *FIX*? Disabled the module for FVTTs stream view.

# v1.1.0

- *Fix* chat cards *sometimes* not being the correct size, when images were still being loaded, when rendering. (Solution is that the card will jump to full size, when finishing loading)
- *Fix* some incompatibility with modules updating chat cards, resulting in repeated popups.
  - Now the module correctly updates the shown notification of the card.
  - If the update is done after the notification already disappeared, it will reappear.
  - There are still some cases possible where this won't work properly, one is the combination of MidiQOL and Dice So Nice. While both alone do work nicely, both together won't result in the chat card being updated properly.
- Moved the event listeners to use delegation instead of being bound to every card, to react to the updated nodes better.

# v1.0.0

**Initial release!**
