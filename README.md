# Epidemic Simulator

### Read me not.

**Note**:
This Simulator was just programmed for fun and does not serve any deeper purpose.

View it online: https://einpandaaa.github.io/epidemic-simulator/
****
## Installation Guide:
If you just want to test the simulator locally you can just execute the index.html.
Be sure that the asset files are in the same directory. <br>
You can also run the simulator on a webserver. Same requirements as in your local environment.
****
## User Guide:
The Population of your simulation will be placed randomly on the matchfield. Every entity will be assign a random movement vector. On collision the movement parameters will be adjusted for both entitys.<br>
By touching an infected entity a healthy one will get incubated. In this state the incubated entity will not spread to other entities. In the process of changing the state to infected the simulation will decide if this entity will die at the end of its infected state.
<br>
****
### Form fields:
**Population:** <br>How many entities the simulation will generate. Please note that a high population number will cause lag. Around 1000 entities will run kinda smoothly. If you got a beast of a pc you could pump this number up a bit.
<br><br>
**Patient Zero's:** <br>Number of incubated start entities.
<br><br>
**Incubation Time:** <br>Time of an entity spent in the incubated state in days.
<br><br>
**Infected Time:** <br>Time of an entity spent in the infected state in days.
<br><br>
**Lethality:** <br>Probability of an entity dying at the end of its infected state in percent.
