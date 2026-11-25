### Solution for "Improper Input Validation" challenge

Systems that accept data from the user should perform all possible data validations for the given context that the data will be used in, and reject the data if it does not conform to the expectations of the data format. Just a few examples include:

- Ensuring data that should represent a number is only comprised of numeric characters and is greater than or equal to zero if the number is expected to be positive
- Ensuring data that should only be a certain length or within a certain range of values conforms to that expectation
- Ensuring reasonableness of data, like it does not really make sense that a user is requesting 1,000,000,000,000 units of a product

To pass this challenge: 

- Inspect the HTML of the form; the goal is to find values that can be tampered with
- Submit the form with values such that a subscription renewal will occur without the system deducting a payment 