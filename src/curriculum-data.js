const asset='https://assets-us-01.kc-usercontent.com/fbd574c4-da36-0066-a0c5-849ffb2de96e/';
export const sources={
 number:asset+'c2dea171-e219-4ec0-b097-24c959fcc924/Number_AODA.pdf',
 algebra:asset+'08f5a14f-576a-4282-af82-096dc302ed10/Algebra_AODA.pdf',
 data:asset+'60e2b2c7-5a7a-4038-bc06-fb88ffd6c861/Data_AODA.pdf',
 spatial:asset+'01b0b598-d5dc-455b-83de-9b7436bcefeb/Spatial_AODA.pdf',
 financial:asset+'8a374255-069f-4539-b020-5737aaf672f9/Financial_AODA.pdf',
 learning:'https://www.dcp.edu.gov.on.ca/en/curriculum/elementary-mathematics/grades/g2-math/strands',
 board:'https://www2.yrdsb.ca/about-us/director-education/directors-annual-report/board-improvement-plan-math',
};
const skill=(code,title,description,example)=>({id:code.toLowerCase().replaceAll('.','-'),code,title,description,example});
const topic=(id,title,rows)=>({id,title,children:rows.map(row=>skill(...row))});
export const curriculum={id:'grade-5',title:'Grade 5',description:'Ontario mathematics curriculum for YRDSB learners. Browse a strand, topic, or individual expectation. This is a curriculum inventory; the full practice library will be added separately.',children:[
 {id:'number',code:'B',title:'Number',source:sources.number,description:'Understand whole numbers, fractions, decimals, and percentages, then use operations to solve and check problems.',children:[
  topic('number-sense','B1 · Number sense',[
   ['B1.1','Whole numbers to 100,000','Read, represent, compose, and decompose whole numbers through 100,000 using place value and different tools.','Represent 48,306 as ten-thousands, thousands, hundreds, tens, and ones.'],
   ['B1.2','Compare and order whole numbers','Compare and order whole numbers through 100,000 in different contexts.','Order 54,090; 54,900; and 45,900.'],
   ['B1.3','Equivalent fractions and mixed numbers','Represent equivalent fractions from halves through twelfths, including improper fractions and mixed numbers.','Show why 3/2 and 1½ represent the same amount.'],
   ['B1.4','Compare and order fractions','Compare and order fractions from halves through twelfths, including improper fractions and mixed numbers.','Which is greater: 3/4 or 5/6? Use a picture or number line.'],
   ['B1.5','Decimals through hundredths','Read, represent, compare, and order decimal numbers through hundredths.','Order 0.7, 0.07, and 0.77.'],
   ['B1.6','Round decimals','Round decimal numbers to the nearest tenth.','Round 3.47 to the nearest tenth.'],
   ['B1.7','Fractions, decimals, and percentages','Explain equivalences among fractions, decimals through hundredths, and whole-number percentages using tools and drawings.','Represent one half as 0.50 and 50%.'],
  ]),
  topic('operations','B2 · Operations',[
   ['B2.1','Operation relationships and multi-step problems','Use operation properties and inverse relationships to solve whole-number and decimal problems requiring more than one operation, and check calculations.','Work out 2 + 3 × 4, explaining which operation comes first.'],
   ['B2.2','Multiplication and division facts','Recall multiplication facts through 12 × 12 and their related division facts.','Use 8 × 7 = 56 to explain 56 ÷ 8.'],
   ['B2.3','Mental math and estimation','Mentally multiply whole numbers by 0.1 and 0.01, and estimate sums and differences of decimals through hundredths.','Explain why 460 × 0.01 = 4.6.'],
   ['B2.4','Add and subtract whole numbers and decimals','Solve addition and subtraction problems with whole-number sums no greater than 100,000 and decimals through hundredths, using tools, strategies, and algorithms.','Calculate 24.75 − 8.60 and check by addition.'],
   ['B2.5','Add and subtract like-denominator fractions','Add and subtract fractions with matching denominators in different contexts. Unlike-denominator addition is an extension beyond this Grade 5 expectation.','Add 2/5 + 1/5 using fifths.'],
   ['B2.6','Two-digit multiplication','Multiply two-digit whole numbers by two-digit whole numbers using area models and algorithms, and connect the methods.','Calculate 24 × 13 using an area model.'],
   ['B2.7','Three-digit by two-digit division','Divide three-digit whole numbers by two-digit whole numbers using area models and algorithms; interpret any remainder appropriately.','Divide 156 ÷ 12 and explain the quotient.'],
   ['B2.8','Whole numbers and unit fractions','Multiply and divide one-digit whole numbers by unit fractions using tools and drawings.','Use fraction strips to explain 3 ÷ 1/2.'],
   ['B2.9','Equivalent ratios and rates','Represent and create equivalent ratios and rates using tools and models in different contexts.','If 2 notebooks cost $6, what would 4 notebooks cost at the same rate?'],
  ]),
 ]},
 {id:'algebra',code:'C',title:'Algebra',source:sources.algebra,description:'Explore patterns, express relationships, solve equations and inequalities, and apply coding and mathematical modelling.',children:[
  topic('patterns','C1 · Patterns and relationships',[
   ['C1.1','Recognize types of patterns','Identify and describe repeating, growing, and shrinking patterns, including patterns in real life.','Describe what happens in 30, 25, 20, 15, …'],
   ['C1.2','Represent patterns','Create and translate growing and shrinking patterns using different representations, including tables of values and graphs.','Show a growing tile pattern as a table and graph.'],
   ['C1.3','Rules, predictions, and missing elements','Find pattern rules, extend patterns, justify predictions, and identify missing elements in repeating, growing, and shrinking patterns.','Find the missing value in 4, 8, __, 16, 20.'],
   ['C1.4','Whole-number and decimal patterns','Create and describe patterns illustrating relationships among whole numbers, tenths, and hundredths.','Describe 0.25, 0.50, 0.75, 1.00, …'],
  ]),
  topic('equations','C2 · Expressions, equations, and inequalities',[
   ['C2.1','Words, expressions, and pictures','Translate among words, algebraic expressions, and visual representations describing equivalent relationships.','Represent “three groups of a number plus two” with a drawing and an expression.'],
   ['C2.2','Evaluate expressions','Evaluate algebraic expressions involving whole numbers.','Find 3n + 2 when n = 4.'],
   ['C2.3','Solve and verify equations','Solve equations involving whole numbers through 100 in different contexts, and verify the solutions.','Solve x + 68 = 95 and substitute your answer to check.'],
   ['C2.4','Solve and graph inequalities','Solve inequalities involving one operation and whole numbers through 50, then verify and graph the solutions.','Find whole-number values satisfying x + 5 < 12.'],
  ]),
  topic('coding','C3 · Coding',[
   ['C3.1','Write mathematical code','Write and execute code representing mathematical situations, including conditional statements and other control structures.','Write an if/else rule that tells whether a whole number is even.'],
   ['C3.2','Read and modify code','Read and alter code with conditional statements and other control structures, and describe how changes affect outcomes.','Change a condition in a pattern program and explain the new output.'],
  ]),
  topic('modelling','C4 · Mathematical modelling',[
   ['C4','Model real-life situations','Understand a real-life problem, analyse assumptions, create a mathematical model, assess its results, and revise it. This overall expectation has no separate specific expectations.','Plan a seating arrangement, test the capacity, and revise the plan.'],
  ]),
 ]},
 {id:'data',code:'D',title:'Data',source:sources.data,description:'Collect representative data, communicate it clearly, analyse it critically, and investigate probability.',children:[
  topic('data-literacy','D1 · Data literacy',[
   ['D1.1','Representative sampling','Explain why different sampling techniques matter when collecting a sample representative of a population.','Would surveying only a soccer team fairly represent the whole school?'],
   ['D1.2','Collect and organize data','Collect data about a population, using suitable sampling techniques, and organize it in relative-frequency tables.','Survey favourite activities and record each category as a fraction of the responses.'],
   ['D1.3','Choose and construct graphs','Select and justify appropriate graphs, including stacked-bar graphs, with suitable scales, sources, titles, and labels.','Compare two classes’ activity preferences with a stacked-bar graph.'],
   ['D1.4','Create infographics','Communicate a data story with an infographic using appropriate representations and relevant information.','Create an infographic about how students travel to school.'],
   ['D1.5','Mean, median, and mode','Determine the mean and median and identify any modes for whole-number and decimal data; explain what they reveal.','Find the mean, median, and mode of 2, 3, 3, 4, 8.'],
   ['D1.6','Interpret data and misleading graphs','Analyse data, including stacked-bar graphs and misleading graphs, ask questions, challenge assumptions, and justify conclusions.','Explain how a graph’s scale might exaggerate a difference.'],
  ]),
  topic('probability','D2 · Probability',[
   ['D2.1','Probabilities as fractions','Express event probabilities as fractions, place them on a probability line, and use them to make predictions.','What is the probability of rolling an even number on a fair six-sided die?'],
   ['D2.2','Theoretical and experimental probability','Determine and compare theoretical and experimental probabilities of an event.','Compare the expected chance of heads with results from 30 coin tosses.'],
  ]),
 ]},
 {id:'spatial',code:'E',title:'Spatial sense',source:sources.spatial,description:'Reason about shapes, views, position, movement, and measurement.',children:[
  topic('geometry','E1 · Geometry, location, and movement',[
   ['E1.1','Triangle properties and construction','Identify triangle properties and construct different types of triangles from given side lengths or angle measurements.','Construct a triangle with sides 5 cm, 6 cm, and 7 cm.'],
   ['E1.2','Congruent shapes','Identify and construct congruent triangles, rectangles, and parallelograms.','Decide whether two triangles have the same shape and size.'],
   ['E1.3','Top, front, and side views','Draw top, front, and side views of objects and match drawings to objects.','Draw three views of a structure made from cubes.'],
   ['E1.4','First-quadrant coordinates','Read and plot first-quadrant coordinates using various scales, and describe translations between points.','Plot (2, 4), then move it three units right.'],
   ['E1.5','Translations, reflections, and rotations','Perform translations, reflections, and rotations through 180° on a grid, and predict the results.','Rotate a triangle 90° about a marked point.'],
  ]),
  topic('measurement','E2 · Measurement',[
   ['E2.1','Metric estimation and measurement','Estimate and measure length, area, mass, and capacity using appropriate metric units.','Choose suitable units for a classroom’s area and a bottle’s capacity.'],
   ['E2.2','Convert larger metric units to smaller units','Use base-ten relationships to convert larger metric units into smaller ones.','Convert 2.5 m into centimetres.'],
   ['E2.3','Compare angles','Compare angles by matching them and measuring with appropriate non-standard units.','Compare two angles using the same paper angle wedge.'],
   ['E2.4','Measure and construct angles','Explain how protractors work; measure and construct angles through 180°; estimate using benchmark angles.','Use a protractor to construct a 65° angle.'],
   ['E2.5','Triangle and parallelogram areas','Use relationships among rectangles, parallelograms, and triangles to develop area formulas and solve problems.','Find the area of a triangle with base 8 cm and perpendicular height 5 cm.'],
   ['E2.6','Equal areas, different perimeters','Show that shapes with equal areas can have different perimeters, and solve related problems.','Compare the perimeters of 3 × 4 and 2 × 6 rectangles.'],
  ]),
 ]},
 {id:'financial',code:'F',title:'Financial literacy',source:sources.financial,description:'Use money concepts and calculations to make informed financial decisions.',children:[
  topic('finances','F1 · Money and financial decisions',[
   ['F1.1','Money transfers','Describe ways money is transferred among individuals, organizations, and businesses.','Compare a cheque with an electronic transfer.'],
   ['F1.2','Transactions and sales tax','Estimate and calculate transaction costs for items priced in dollars and cents, including sales tax.','Calculate the total for two purchases using a given tax rate.'],
   ['F1.3','Basic budgets','Design basic budgets for different earning and spending situations.','Plan how to allocate $40 between spending and saving.'],
   ['F1.4','Credit and debt','Explain credit and debt and describe how they affect financial decisions.','Explain how borrowing money changes what you can spend later.'],
   ['F1.5','Unit rates and best value','Calculate unit rates for goods and services and identify which options offer better value.','Compare 5 apples for $1 with 3 apples for $0.75.'],
   ['F1.6','Taxes and public services','Describe taxes collected by different Canadian government levels and how revenue funds community services.','Connect examples of taxes to public services.'],
  ]),
 ]},
 {id:'learning',code:'A',title:'Learning skills and mathematical processes',source:sources.learning,description:'These skills are integrated across the other strands, rather than taught only as a separate calculation unit.',children:[
  topic('learning-skills','A1 · Learning throughout mathematics',[
   ['A1.1','Manage emotions','Identify and manage emotions while engaging in mathematics.','Explain how you feel when a problem is unfamiliar.'],
   ['A1.2','Cope with challenges','Recognize stress and use strategies for coping with mathematical challenges.','Pause, try a drawing, or ask a useful question when stuck.'],
   ['A1.3','Persist and stay motivated','Maintain motivation and perseverance when working through problems.','Try another strategy after a first attempt does not work.'],
   ['A1.4','Collaborate and communicate','Build relationships, listen to different mathematical ideas, and communicate respectfully.','Compare two solution methods with a partner.'],
   ['A1.5','Confidence and self-awareness','Develop awareness of yourself as a capable mathematics learner.','Describe a strategy you have improved at using.'],
   ['A1.6','Critical and creative thinking','Think critically and creatively to support mathematical decisions and problem solving.','Explain whether an answer is reasonable and find another approach.'],
  ]),
 ]},
]};
export const suggestedSequence=[
 ['Whole-number understanding and facts','Place value, comparison, multiplication and division facts.'],
 ['Whole-number calculations','Operation properties, algorithms, and inverse checks.'],
 ['Decimals','Hundredths, rounding, estimation, and calculations.'],
 ['Fractions','Equivalent forms, comparisons, and Grade 5 operations.'],
 ['Connections, ratios, and rates','Fractions, decimals, percentages, and equivalent ratios.'],
 ['Patterns and algebra','Expressions, equations, inequalities, and representations.'],
 ['Geometry and measurement','Shapes, coordinates, transformations, units, and area.'],
 ['Data and financial applications','Data, probability, budgets, transactions, and value.'],
];
