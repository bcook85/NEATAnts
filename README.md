# NEATAnts
A simple simulation of an ant colony gathering food by way of Neural Evolution of Augmenting Topologies.

Green tiles are food. Purple tiles are hazards. Blue tiles are pheromone trails left by the ants. The yellow dot is the colony. Red dots are ants without food. Red dots with a green dot are ants carrying food.

Each ant must leave the colony in search for food. Finding food resets the age of the ant and adds to its score. If the ant successfully brings food back to the colony, the Colony Food count increases and the ant is awarded more points as well having its age reset again. If an ant touches a hazard or moves off-screen, the ant is immediately killed. When an ant dies, that ant's brain and the brains of all living ants have their fitness level calculated. Then, a new brain is selected randomly by crossing over 2 parent brains, biased toward higher scoring brains. At the start, all ant brains are completely random.

Each ant has a total of 14 inputs. The ant sees the 6 tiles directly in front of the ant. They receive both the tile type and tile strength. If the ant is carrying food or not, 1 or 0. And finally, is the ant facing the colony. If the direction of the colony is within 45 degrees of the ant's direction, either way, then facing is 1.

I consider isFacing cheating, but without some kind of indication of where they are in the world in relation to the colony, all ants end up spinning in circles after a few dozen generations.

Based on the neural network by Daniel Shiffman from the YouTube channel, The Coding Train.
YouTube Channel: https://www.youtube.com/user/shiffman/featured
