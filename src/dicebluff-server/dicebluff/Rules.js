class Rules {

	constructor(custom_ruleset = null)
	{
		let ruleset = {
			dice_value_min: 1,
			dice_value_max: 6,
			dice_count_max: 10
		};

		if (custom_ruleset !== null) {
			Object.assign(ruleset, custom_ruleset);
		}

	}


	DiceRoll(dice_object)
	{
		dice_object.forEach(function(dice) {
			if (Object.size(dice_object) <= this.ruleset.dice_count_max) {
				if (dice.value >= this.ruleset.dice_value_min
						&& dice.value <= this.ruleset.dice_value_max) {
					return true;
				}
			}
		});

		return false;
	}

}

export {
	Rules as default
}
