// Specification of Grades 9–10 skills and their question templates. Consumed by scripts/build-secondary-data.mjs.
// A template is [rule, styles, suffix]. `suffix` extends the skill title ("another way", "in context", …).
const T=(rule,a,b)=>[[rule,a,''],[rule,b,'another way'],[rule,null,'mixed practice']];
const guided=(items)=>({guided:items});

export const SEL=[
 ['AA1.1','Manage emotions','Identify and manage emotions while engaging in mathematics.','manage-emotions'],
 ['AA1.2','Cope with challenges','Recognize stress and use strategies for coping with mathematical challenges.','cope-challenge'],
 ['AA1.3','Persist and stay motivated','Maintain motivation and perseverance when working through problems.','persist'],
 ['AA1.4','Collaborate and communicate','Build relationships, listen to different mathematical ideas, and communicate respectfully.','communicate'],
 ['AA1.5','Confidence and self-awareness','Develop awareness of yourself as a capable mathematics learner.','confidence'],
 ['AA1.6','Critical and creative thinking','Think critically and creatively to support mathematical decisions and problem solving.','critical-thinking']
];

export const GRADE9={
 id:'ontario-math-grade-9',grade:9,course:'MTH1W',
 strands:[
  {id:'g9-learning',code:'AA',title:'Social-emotional learning skills',source:'https://www.dcp.edu.gov.on.ca/en/curriculum/secondary-mathematics/courses/mth1w/strands/aa-sel',
   topics:[{id:'g9-aa1-topic',title:'AA1 · Social-emotional learning skills',skills:'SEL'}]},
  {id:'g9-processes',code:'A',title:'Mathematical thinking and making connections',source:'https://www.dcp.edu.gov.on.ca/en/curriculum/secondary-mathematics/courses/mth1w/strands/a-mathematical-thinking-and-making-connections',
   topics:[{id:'g9-a-topic',title:'A · Processes and connections',skills:[
    ['A1','Mathematical processes','Apply the mathematical processes to build understanding and procedural fluency.','Choose a problem and name the processes you used.',guided([
      ['Think about a problem you solved this week. Which of the seven mathematical processes did you use: problem solving, reasoning and proving, reflecting, selecting tools and strategies, connecting, representing, communicating?','Name two processes and the moment in your work where each one helped.','A process is a way of working, not a topic: describe what you did, not what the problem was about.'],
      ['A classmate says a line of reasoning “proves” a pattern because it worked for 3 examples. How could you test it further?','Try an example that might break the pattern, then try to explain why it must always hold.','Examples can suggest a conjecture; a general argument or a counter-example settles it.'],
      ['Choose a tool for a problem: a table, a graph, algebra tiles or a calculator. Explain why it fits better than another tool.','Say what each tool shows well and what it hides.','Tools are chosen to match the task, then the result is checked for reasonableness.'],
      ['Write one sentence that communicates a solution to a classmate who missed the lesson. Use a correct mathematical term.','Include what you did, why it works and what the answer means in context.','Good communication uses vocabulary and a representation that the reader can follow.']])],
    ['A2','Making connections','Connect mathematics to knowledge systems, lived experience, real-life uses and careers.','Describe where this math appears outside class.',guided([
      ['Find a place in your community where percentages, rates or ratios affect decisions. Describe one real example.','Name the quantities and say which mathematical idea compares them.','Ask who uses this idea in their job and why accuracy matters.'],
      ['Many cultures developed ways of counting, measuring and recording. Pick one measurement system you know and describe how it is used.','Say what unit it uses and how it compares with metric units.','Connections include respecting the knowledge of the communities that created these systems.'],
      ['Choose a career that uses geometry or algebra. Describe one task and the mathematics behind it.','Write the task in words, then name the relationship or formula.','Careers combine several strands: a surveyor uses trigonometry, measurement and data.'],
      ['Describe a time you used math at home, in sports or in a hobby. Which strand of mathematics was it?','Explain the quantities involved and how you decided what to do.','Real situations are usually modelled: some details are simplified so mathematics can help.']])]
   ]}]},
  {id:'g9-number',code:'B',title:'Number',source:'https://www.dcp.edu.gov.on.ca/en/curriculum/secondary-mathematics/courses/mth1w/strands/b-number',
   topics:[
    {id:'g9-b1-topic',title:'B1 · Development of numbers and number sets',skills:[
     ['B1.1','Development and use of numbers','Research a number concept and tell a story about its development, use and relevance.','Tell the story of zero, the Hindu–Arabic numerals, or Indigenous counting systems.',guided([
       ['Research how a number idea such as zero, negative numbers or place value developed in one culture. Tell its story in three sentences.','Say who used it, what problem it solved and where we use it today.','Check your sources: more than one source should agree on the main facts.'],
       ['Compare two number systems, for example Roman numerals and our place-value system. What can each do easily and what is hard?','Write the same number in both systems and compare how you add it to another number.','Place value and a symbol for zero make calculation much easier than adding symbols.'],
       ['Pick a current use of large or tiny numbers (data storage, populations, distances). Which number idea helps us handle them?','Describe the numbers in scientific notation and say what the exponent tells you.','Explain why a story about numbers can make them more meaningful.'],
       ['Interview someone about how they use numbers in their work. What number ideas do they rely on?','List three numbers they use and the unit or meaning attached to each.','Relevance means the idea matters today, not only in history.']])],
     ['B1.2','Number sets','Describe how subsets of the real numbers are defined and how they are alike and different.',null,'sets'],
     ['B1.3','Density, infinity and limits','Use patterns to explain density, infinity and limits for number sets.',null,'density']]},
    {id:'g9-b2-topic',title:'B2 · Powers',skills:[
     ['B2.1','Powers and scientific notation','Relate the sign and size of an exponent to the value of a power; use scientific notation.',null,'powers'],
     ['B2.2','Exponent laws','Use patterns to develop the exponent laws and simplify numeric and algebraic expressions.',null,'laws']]},
    {id:'g9-b3-topic',title:'B3 · Number sense and operations',skills:[
     ['B3.1','Integers in context','Use integers to describe location, direction, amount and changes.',null,'integers'],
     ['B3.2','Unit fractions and measuring tools','Use unit fractions and their relationships to other fractional amounts, including measuring tools.',null,'unitfractions'],
     ['B3.3','Signs in ratios, rates, fractions and decimals','Explain how positive and negative signs affect ratios, rates, fractions and decimals.',null,'signed'],
     ['B3.4','Operations with fractions and mixed numbers','Solve problems with positive and negative fractions and mixed numbers.',null,'fractions'],
     ['B3.5','Rates, percentages and proportions','Pose and solve problems with rates, percentages and proportions in real contexts.',null,'rates']]}
   ]},
  {id:'g9-algebra',code:'C',title:'Algebra',source:'https://www.dcp.edu.gov.on.ca/en/curriculum/secondary-mathematics/courses/mth1w/strands/c-algebra',
   topics:[
    {id:'g9-c1-topic',title:'C1 · Algebraic expressions and equations',skills:[
     ['C1.1','Development and use of algebra','Research an algebraic concept and tell a story about its development, use and relevance.','Tell the story of al-jabr, the equals sign or variables.',guided([
       ['Research the origin of the word “algebra” (al-jabr). What did the technique do?','Describe in your own words what “restoring” or “balancing” an equation means.','Connect the idea to solving x + 5 = 12 by doing the same thing to both sides.'],
       ['Before symbols, problems were written in words. Rewrite “a number plus seven is nineteen” with a variable and compare the two forms.','Say which one is easier to work with and why.','Symbols let us manipulate a relationship without re-reading the story each time.'],
       ['Find one real use of algebra in a job, game or app. Describe the unknown it finds.','Write the situation as an equation or formula.','Relevance: explain what decision the algebra supports.'],
       ['Compare two ways cultures solved linear problems (for example guess-and-check, balancing, or symbolic steps).','Solve 2x + 3 = 11 with both a balance picture and symbols.','Different methods can give the same answer; check by substituting.']])],
     ['C1.2','Write expressions to generalize','Create algebraic expressions that generalize relationships in words, numbers and diagrams.',null,'write'],
     ['C1.3','Compare expressions','Decide whether expressions are equivalent using concrete, numerical, graphical and algebraic methods.',null,'equivalent'],
     ['C1.4','Simplify expressions','Simplify expressions using the properties of operations.',null,'simplify'],
     ['C1.5','Create and solve equations','Create and solve equations for various contexts and verify the solutions.',null,'solve']]},
    {id:'g9-c2-topic',title:'C2 · Coding',skills:[
     ['C2.1','Use coding for algebraic concepts','Use code to show variables, parameters, equations and inequalities.',null,'code1'],
     ['C2.2','Decompose problems into steps','Create code by decomposing situations into computational steps.',null,'code2'],
     ['C2.3','Read and alter code','Read code to predict output, and alter its parameters or constraints.',null,'code3']]},
    {id:'g9-c3-topic',title:'C3 · Application of relations',skills:[
     ['C3.1','Compare linear and non-linear relations','Compare the shapes of graphs to describe rates of change, growth and predictions.',null,'compare'],
     ['C3.2','Represent linear relations','Represent linear relations with materials, tables, graphs and equations.',null,'represent'],
     ['C3.3','Compare two linear relations','Compare two lines y = ax + b graphically and algebraically and interpret their intersection.',null,'twolines']]},
    {id:'g9-c4-topic',title:'C4 · Characteristics of relations',skills:[
     ['C4.1','Compare characteristics of relations','Compare the tables, graphs and equations of linear and non-linear relations.',null,'characteristics'],
     ['C4.2','Graph linear forms and regions','Graph x = k, y = k, x + y = k, x − y = k, ax + by = k, xy = k and their inequalities.',null,'forms'],
     ['C4.3','Transform lines','Translate, reflect and rotate lines y = ax and describe the effect on graphs and equations.',null,'transform'],
     ['C4.4','Equations of lines','Find equations of lines from graphs, tables and materials using slope and y-intercept.',null,'lineequation']]}
   ]},
  {id:'g9-data',code:'D',title:'Data',source:'https://www.dcp.edu.gov.on.ca/en/curriculum/secondary-mathematics/courses/mth1w/strands/d-data',
   topics:[
    {id:'g9-d1-topic',title:'D1 · Collection, representation and analysis of data',skills:[
     ['D1.1','Large data and its implications','Identify a context with a lot of data and describe the implications of collecting, storing and using it.','Discuss what data an app collects and why privacy matters.',guided([
       ['Pick an app you use. What data does it collect about you and why might it want it?','List three types of data and one benefit and one risk of each.','Decide who should control the data and how long it should be kept.'],
       ['A store records every purchase. How could that data be useful, and how could it be misused?','Name a decision the store could make with the data.','Think about whether customers know and agreed to this use.'],
       ['Data can be biased if it leaves some people out. Describe one way a data set might miss a group.','Explain how the missing group could be treated unfairly by decisions based on the data.','Suggest a change in how the data is collected.'],
       ['Explain the difference between data being stored and data being represented in a graph. Which choices does a graph hide?','Describe how a different scale or interval could change what a viewer concludes.','Good representations are honest about scale, source and limits.']])],
     ['D1.2','Quartiles and box plots','Represent and analyse one-variable data, including quartiles and box plots.',null,'quartiles'],
     ['D1.3','Scatter plots and models','Create scatter plots, test regression models with technology and make predictions.',null,'correlation']]},
    {id:'g9-d2-topic',title:'D2 · Mathematical modelling',skills:[
     ['D2.1','Value of mathematical modelling','Describe how mathematical modelling informs real-life decisions.','Name a decision informed by a model.',guided([
       ['Weather forecasts, ride-share prices and epidemic projections all use models. Pick one and say what question it answers.','List two inputs the model needs and one thing it ignores.','Explain how a decision-maker could use the model and why they should know its limits.'],
       ['A model says a pool will fill in 4 hours. What assumption is hidden behind that statement?','State the rate and what would change if the rate changed.','A model is useful when its assumptions are clear and reasonable.'],
       ['Compare a map with a model. What does each simplify on purpose?','Say what a map leaves out and why that helps.','All models are simplified: the question is whether the simplification matters for the decision.'],
       ['Why do engineers build a scale model before the real bridge?','Describe what they can test and what the model cannot show.','Models support decisions without the cost or risk of the real thing.']])],
     ['D2.2','Identify a question and information needed','Identify a question that needs data and decide what information is required.','Write a question and list the data you need.',guided([
       ['Write a question about your school that needs data to answer, such as “How do students travel to school?”. What information do you need?','Decide the variable, the group and the time period.','Check that the question can be answered with numbers or categories.'],
       ['“Is the new bike lane working?” is a broad question. Make it more specific and measurable.','Choose what to measure: counts, speeds, or safety reports.','Say what “working” means in numbers.'],
       ['What is the difference between a population and a sample? Give an example for a question about favourite music.','Describe who would be in each group.','A sample should represent the population to give a fair answer.'],
       ['A friend asks, “Which phone is best?”. List the factors you would collect data on and how you would weight them.','Say which factors are numbers and which are opinions.','Plan how to compare the data fairly.']])],
     ['D2.3','Plan and carry out data collection','Create a plan to collect data, state assumptions and what may vary, and carry it out.','Plan a survey or experiment and say what might vary.',guided([
       ['Plan a survey of 30 students about daily screen time. Describe the question wording and how you choose who to ask.','Name one possible source of bias and how you reduce it.','Decide how you will record the answers.'],
       ['You want to know how bounce height depends on drop height. List what you will keep the same and what you will change.','Describe how many trials you will do for each height and why.','Explain how you will record and average the results.'],
       ['State two assumptions you make when you model the time to fill a pool from a hose.','Say what could vary during the day and how that affects the model.','Plan a check that tests whether the assumptions hold.'],
       ['Choose a secondary source such as Statistics Canada. What makes it reliable and what should you check before using its data?','Note the date, the method and any definitions.','Decide which columns answer your question.']])],
     ['D2.4','Display and analyse data to build a model','Choose ways to display and analyse data, considering its nature, context and assumptions, to create a model.','Choose a graph type and explain why it suits the data.',guided([
       ['Data show the height of a plant each week. Which graph helps you build a model, and why?','Describe the pattern you look for and whether a line or a curve fits.','Choose a model equation and explain what each number means.'],
       ['You have a table of temperature and ice-cream sales. How would you display and analyse it?','Say what a scatter plot, a line of best fit and the correlation tell you.','Mention one reason the relationship might not be causal.'],
       ['One data point is far from the others. Should you remove it? Explain what you would check first.','Describe how the model changes with and without the point.','Report your decision and the reason.'],
       ['Compare two models for the same data: a line and a curve. How do you decide which fits better?','Look at the pattern of residuals and the context.','The better model is the one that fits and makes sense for the situation.']])],
     ['D2.5','Report on a model','Report how a model answers the question, how well it fits, its limits and predictions.','Write a short report on what a model tells us and where it fails.',guided([
       ['Write a two-sentence conclusion for a model that predicts bus ridership. Include a prediction and a limit.','State the prediction with its units and the range where it should be reliable.','Mention one reason to be careful outside that range.'],
       ['How would you tell a classmate whether your model fits the data well?','Mention a graph, a measure such as r, and the size of typical errors.','Explain what “good enough” means for the decision.'],
       ['List two limitations of a linear model for a population that grows quickly.','Explain what the model gets wrong as time passes.','Suggest how you would improve the model.'],
       ['A model predicts you will save $400 in 8 months. Under what circumstances would that prediction fail?','List the assumptions behind it.','Describe how you would update the model after a change.']])]]}
   ]},
  {id:'g9-geometry',code:'E',title:'Geometry and measurement',source:'https://www.dcp.edu.gov.on.ca/en/curriculum/secondary-mathematics/courses/mth1w/strands/e-geometry-and-measurement',
   topics:[{id:'g9-e1-topic',title:'E1 · Geometric and measurement relationships',skills:[
     ['E1.1','Development of geometry and measurement','Research a geometric concept or measurement system and describe its use and relevance to careers.','Tell the story of the Pythagorean theorem or a traditional measurement system.',guided([
       ['The Pythagorean relationship was known in Mesopotamia, China, India and Greece. Choose one culture and describe how it used the idea.','Say what problem it solved, such as building or surveying.','Explain why the same discovery could occur in several places.'],
       ['Compare the imperial and metric systems. How did each develop and where is each still used?','Convert one measurement in each direction.','Explain why a consistent system matters for trade and engineering.'],
       ['Many cultures used the human body for measures such as the cubit, foot or hand. What are the benefits and problems?','Explain how a standard unit fixes the problems.','Say which careers still rely on precise units.'],
       ['Find a career that uses geometry, like architecture, surveying or animation. Describe one task and its mathematics.','Name the shape or relationship and the quantity measured.','Explain what could go wrong if the measurement were inaccurate.']])],
     ['E1.2','Circle and triangle properties','Create and analyse designs using geometric relationships and circle and triangle properties.',null,'circletriangle'],
     ['E1.3','Units within and between systems','Solve problems with units within and between measurement systems, including from various cultures.',null,'units'],
     ['E1.4','Changing dimensions','Show how changing dimensions affects perimeter, area, surface area and volume.',null,'scale'],
     ['E1.5','Pythagorean theorem','Solve right-triangle side problems, including composite shapes.',null,'pythagoras'],
     ['E1.6','Volumes of solids','Use relationships between prism and pyramid volumes and between cylinder and cone volumes.',null,'volume']]}]},
  {id:'g9-financial',code:'F',title:'Financial literacy',source:'https://www.dcp.edu.gov.on.ca/en/curriculum/secondary-mathematics/courses/mth1w/strands/f-financial-literacy',
   topics:[{id:'g9-f1-topic',title:'F1 · Financial decisions',skills:[
     ['F1.1','Financial situations and decisions','Explain how a past or current financial situation can inform financial decisions.','Describe a financial situation and what it teaches.',guided([
       ['A family’s housing costs rose 20% in two years. Describe how this could affect other spending decisions.','List the budget lines that might change.','Say what information you need to make a plan.'],
       ['Explain why inflation means $100 buys less over time.','Give an example with a price that rises by 3% each year.','Say how a saver could respond.'],
       ['A friend is offered a store credit card with a discount today and high interest later. What questions should they ask?','Say how you would compare the discount with the interest cost.','Describe a decision rule the friend could use.'],
       ['Describe a situation from the news that shows how interest rates affect borrowers and savers.','Say who gains and who loses when rates rise.','Explain how a household could adapt.']])],
     ['F1.2','Appreciation and depreciation','Recognize situations with appreciation and depreciation and use graphs to answer questions.',null,'appreciation'],
     ['F1.3','Interest, loans and down payments','Compare interest rates, loan lengths, interest methods and down payments on the overall cost.',null,'borrowing'],
     ['F1.4','Modify budgets','Modify budgets for changing circumstances and give a rationale.',null,'budget']]}]}
 ]
};

// Map the `kind` keyword of a skill to its template list (three per skill: two focused style sets and a mixed one).
export const KIND9={
 sets:T('sec-number-sets',[0,1,2],[3,4,5]),density:T('sec-density',[0,1,2],[3,4,5]),
 powers:[...T('sec-power-value',[0,1,2],[3,4,5]),...T('sec-scientific',[0,1,2],[3,4,5]).slice(0,2)],
 laws:T('sec-exponent-laws',[0,1,2],[3,4,5,6]),integers:T('sec-integer-context',[0,1,2],[3,4,5]),unitfractions:T('sec-unit-fraction',[0,1,2],[3,4,5]),
 signed:T('sec-signed-rational',[0,1,2],[3,4,5]),fractions:T('sec-fraction-ops',[0,1,2,3],[4,5,6]),rates:T('sec-rates-percent',[0,1,2,3],[4,5,6]),
 write:T('sec-write-expression',[0,1,2],[3,4,5]),equivalent:T('sec-equivalent-expressions',[0,1,2],[3,4,5]),simplify:T('sec-simplify',[0,1,2],[3,4,5]),
 solve:T('sec-solve-linear',[0,1,2,3],[4,5,6]),code1:T('sec-code-trace',[0,1,2],[3,4,5]),code2:T('sec-code-trace',[0,3,4],[1,2,5]),code3:T('sec-code-trace',[3,2,5],[0,1,4]),
 compare:T('sec-relation-compare',[0,1,2],[3,4,5]),represent:T('sec-linear-represent',[0,1,2],[3,4,5]),twolines:T('sec-two-lines',[0,1,2],[3,4,5]),
 characteristics:T('sec-characteristics',[0,1,2],[3,4,5]),forms:T('sec-graph-forms',[0,1,2,3],[4,5,6,7]),transform:T('sec-line-transform',[0,1,2],[3,4,5]),
 lineequation:T('sec-line-equation',[0,1,2],[3,4,5]),quartiles:T('sec-quartiles',[0,1,2,3],[4,5,6,7]),correlation:T('sec-correlation',[0,1,2],[3,4,5]),
 circletriangle:T('sec-circle-triangle',[0,1,2,3],[4,5,6,7]),units:T('sec-unit-convert',[0,1,2,3],[4,5,6,7]),scale:T('sec-scale-effect',[0,1,2,3],[4,5,6,7]),
 pythagoras:T('sec-pythagoras',[0,1,2,3],[4,5,6,7]),volume:T('sec-volume',[0,1,2,3],[4,5,6,7]),
 appreciation:T('sec-appreciation',[0,1,2],[3,4,5]),borrowing:T('sec-borrowing',[0,1,2],[3,4,5]),budget:T('sec-budget-modify',[0,1,2],[3,4,5])
};

export const GRADE10={
 id:'ontario-math-grade-10',grade:10,course:'MPM2D',
 strands:[
  {id:'g10-processes',code:'P',title:'Mathematical processes',source:'https://www.edu.gov.on.ca/eng/curriculum/secondary/math910curr.pdf',
   topics:[{id:'g10-p-topic',title:'P · Mathematical process expectations',skills:[
    ['P1','Mathematical processes','Use problem solving, reasoning, reflecting, tools, connecting, representing and communicating in every strand.','Explain how you checked a solution.',guided([
      ['Choose a quadratic problem you solved. How did you check that the answer makes sense in context?','Describe one check by substituting, one by graphing and one by estimating.','Explain which check would catch a sign error.'],
      ['You solved a system and found (3, 4). How could you verify it using two different representations?','Substitute into both equations and show the lines on a graph.','Explain what a failed check would tell you.'],
      ['A classmate’s trigonometry answer is 125 m for the height of a flagpole. Without recalculating, how do you judge whether it is reasonable?','Use a sketch and compare the sides of the triangle.','Say how the angle and the horizontal distance limit the possible height.'],
      ['Describe how you would communicate a multi-step solution so that another student can follow it.','Label a diagram, state the formula, show the substitution and give a final sentence with units.','Check that each line follows from the one before it.']])]]}]},
  {id:'g10-quadratic',code:'QR',title:'Quadratic relations of the form y = ax² + bx + c',source:'https://www.edu.gov.on.ca/eng/curriculum/secondary/math910curr.pdf',
   topics:[
    {id:'g10-qr1-topic',title:'QR1 · Basic properties of quadratic relations',skills:[
     ['QR1.1','Collect and model quadratic data','Collect data that follow a quadratic relation and draw a curve of best fit.',null,'qdata'],
     ['QR1.2','Parabolas and second differences','Show that a quadratic relation graphs as a parabola with constant second differences.',null,'second'],
     ['QR1.3','Key features of a parabola','Identify the axis of symmetry, vertex, y-intercept, zeros and maximum or minimum.',null,'features'],
     ['QR1.4','Quadratic and exponential relations','Compare y = x² and y = 2ˣ and give meaning to negative and zero exponents.',null,'expq']]},
    {id:'g10-qr2-topic',title:'QR2 · Transformations of y = x²',skills:[
     ['QR2.1','Effects of a, h and k','Identify how translations, reflections and stretches change y = x².',null,'trans1'],
     ['QR2.2','Roles of a, h and k','Explain the roles of a, h and k in y = a(x − h)² + k.',null,'trans2'],
     ['QR2.3','Sketch by transformations','Sketch y = a(x − h)² + k by transforming y = x².',null,'sketch'],
     ['QR2.4','Equation from a graph','Determine the equation y = a(x − h)² + k of a parabola from its graph.',null,'paraeq']]},
    {id:'g10-qr3-topic',title:'QR3 · Solving quadratic equations',skills:[
     ['QR3.1','Expand and simplify','Expand and simplify second-degree polynomial expressions.',null,'expand'],
     ['QR3.2','Factor polynomials','Factor common factors, trinomials and differences of squares.',null,'factor'],
     ['QR3.3','Factors, zeros and intercepts','Connect factors of a quadratic to the zeros and x-intercepts of its graph.',null,'zeros'],
     ['QR3.4','Real and non-real roots','Interpret real and non-real roots using graphs and the discriminant.',null,'disc'],
     ['QR3.5','Complete the square','Express y = ax² + bx + c in the form y = a(x − h)² + k.',null,'csq'],
     ['QR3.6','Sketch from y = ax² + bx + c','Graph a quadratic relation by intercepts, symmetry or completing the square.',null,'gq'],
     ['QR3.7','The quadratic formula','Explore the development of the quadratic formula and use it.',null,'qf'],
     ['QR3.8','Solve quadratic equations','Solve quadratic equations with real roots by factoring, the formula or graphing.',null,'sq']]},
    {id:'g10-qr4-topic',title:'QR4 · Applying quadratic models',skills:[
     ['QR4.1','Zeros and extreme values','Find zeros and maximum or minimum values from a graph or equation.',null,'maxmin'],
     ['QR4.2','Quadratic models in context','Solve problems from realistic situations modelled by quadratic relations.',null,'qapp']]}
   ]},
  {id:'g10-analytic',code:'AG',title:'Analytic geometry',source:'https://www.edu.gov.on.ca/eng/curriculum/secondary/math910curr.pdf',
   topics:[
    {id:'g10-ag1-topic',title:'AG1 · Using linear systems to solve problems',skills:[
     ['AG1.1','Solve linear systems','Solve systems of two linear equations by substitution and elimination.',null,'systems'],
     ['AG1.2','Linear systems in context','Solve problems from realistic situations using linear systems.',null,'sysproblem']]},
    {id:'g10-ag2-topic',title:'AG2 · Properties of lines and line segments',skills:[
     ['AG2.1','Midpoint of a segment','Develop and use the formula for the midpoint of a segment.',null,'midpoint'],
     ['AG2.2','Length of a segment','Develop and use the formula for the length of a segment.',null,'length'],
     ['AG2.3','The circle x² + y² = r²','Develop the equation of a circle centred at the origin.',null,'circle1'],
     ['AG2.4','Radius and equation of a circle','Find the radius from an equation, write the equation from a radius, and sketch the circle.',null,'circle2'],
     ['AG2.5','Slope, length and midpoint problems','Solve problems involving the slope, length and midpoint of a segment.',null,'segments']]},
    {id:'g10-ag3-topic',title:'AG3 · Verifying properties of figures',skills:[
     ['AG3.1','Investigate figure properties','Investigate characteristics of figures such as medians and similar figures on right triangles.',null,'props'],
     ['AG3.2','Verify properties with coordinates','Verify perpendicular lines, equal sides and other properties using analytic geometry.',null,'verify'],
     ['AG3.3','Multi-step verification','Plan and carry out a multi-step strategy to verify a property of a figure.',null,'verify2']]}
   ]},
  {id:'g10-trig',code:'TR',title:'Trigonometry',source:'https://www.edu.gov.on.ca/eng/curriculum/secondary/math910curr.pdf',
   topics:[
    {id:'g10-tr1-topic',title:'TR1 · Similar triangles',skills:[
     ['TR1.1','Properties of similar triangles','Verify the properties of similar triangles.',null,'sim1'],
     ['TR1.2','Similarity and congruence','Describe and compare similarity and congruence.',null,'sim2'],
     ['TR1.3','Similar triangles in realistic situations','Solve problems with similar triangles such as shadows and scale models.',null,'sim3']]},
    {id:'g10-tr2-topic',title:'TR2 · Right-triangle trigonometry',skills:[
     ['TR2.1','Sine, cosine and tangent','Define the primary trigonometric ratios from similar right triangles.',null,'ratios'],
     ['TR2.2','Solve right triangles','Find side lengths and angles using the primary ratios and the Pythagorean theorem.',null,'right'],
     ['TR2.3','Right-triangle applications','Solve real-life problems with the primary ratios.',null,'rapp']]},
    {id:'g10-tr3-topic',title:'TR3 · Acute triangles',skills:[
     ['TR3.1','The sine law','Explore the sine law in acute triangles and use it.',null,'sine'],
     ['TR3.2','The cosine law','Explore the cosine law in acute triangles and use it.',null,'cosine'],
     ['TR3.3','Solve acute triangles','Find sides and angles of acute triangles with the sine and cosine laws.',null,'oblique'],
     ['TR3.4','Acute-triangle problems','Solve problems about acute triangles in realistic situations.',null,'oapp']]}
   ]}
 ]
};

export const KIND10={
 qdata:T('sec-quadratic-data',[0,1,2],[3,4,5]),second:T('sec-second-differences',[0,1,2],[3,4,5]),features:T('sec-parabola-features',[0,1,2,3],[4,5,6,7]),
 expq:T('sec-exponential-vs-quadratic',[0,1,2],[3,4,5]),trans1:T('sec-transformations',[0,1,2,3],[4,5,6,7]),trans2:T('sec-transformations',[3,2,5],[1,4,6,7]),
 sketch:T('sec-sketch-parabola',[0,1,2],[3,4,5]),paraeq:T('sec-parabola-equation',[0,1,2],[3,4,5]),expand:T('sec-expand',[0,1,2,3],[4,5,6,7]),
 factor:T('sec-factor',[0,1,2,3],[4,5,6,7]),zeros:T('sec-zeros-from-factors',[0,1,2,3],[4,5,6,7]),disc:T('sec-discriminant',[0,1,2],[3,4,5]),
 csq:T('sec-complete-square',[0,1,2],[3,4,5]),gq:T('sec-graph-quadratic',[0,1,2],[3,4,5]),qf:T('sec-quadratic-formula',[0,1,2],[3,4,5,6]),
 sq:T('sec-solve-quadratic',[0,1,2,3],[4,5,6,7]),maxmin:T('sec-quadratic-max-min',[0,1,2],[3,4,5]),qapp:T('sec-quadratic-application',[0,1,2],[3,4,5,6]),
 systems:T('sec-linear-system',[0,1,2,3],[4,5,6,7]),sysproblem:T('sec-system-problem',[0,1,2],[3,4,5]),midpoint:T('sec-midpoint',[0,1,2],[3,4,5]),
 length:T('sec-length',[0,1,2],[3,4,5]),circle1:T('sec-circle-equation',[0,1,2,3],[4,5,6]),circle2:T('sec-circle-equation',[1,0,5],[2,3,6]),
 segments:T('sec-segment-problems',[0,1,2],[3,4,5]),props:T('sec-geometry-properties',[0,1,2],[3,4,5]),verify:T('sec-verify-shapes',[0,1,2],[3,4,5]),
 verify2:T('sec-verify-property',[0,1,2],[3,4,5]),sim1:T('sec-similar-triangles',[0,1,2],[3,4,5]),sim2:T('sec-similar-congruent',[0,1,2],[3,4,5]),
 sim3:T('sec-similar-application',[0,1,2],[3,4,5]),ratios:T('sec-trig-ratios',[0,1,2,3],[4,5,6,7]),right:T('sec-right-triangle',[0,1,2,3],[4,5,6,7]),
 rapp:T('sec-trig-application',[0,1,2],[3,4,5,6]),sine:T('sec-sine-law',[0,1,2],[3,4,5]),cosine:T('sec-cosine-law',[0,1,2],[3,4,5]),
 oblique:T('sec-oblique-triangles',[0,1,2],[3,4,5]),oapp:T('sec-oblique-application',[0,1,2],[3,4,5])
};

export const SEQUENCE9=[
 ['Numbers and powers','Number sets, exponent laws, scientific notation, integers, fractions, rates and percentages.'],
 ['Algebra and relations','Expressions, equations, code, linear and non-linear relations, lines and transformations.'],
 ['Data and modelling','Quartiles, box plots, scatter plots and the modelling process.'],
 ['Geometry, measurement and money','Circle and triangle properties, units, scale, Pythagoras, volumes, interest, depreciation and budgets.']
];
export const SEQUENCE10=[
 ['Quadratic relations','Parabolas, transformations, factoring, completing the square, the quadratic formula and models.'],
 ['Analytic geometry','Linear systems, midpoints, distance, circles at the origin and verifying figures with coordinates.'],
 ['Trigonometry','Similar triangles, sine, cosine and tangent, and the sine and cosine laws in acute triangles.']
];
