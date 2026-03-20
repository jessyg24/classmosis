-- Classmosis Standards Seed
-- ~120 Common Core anchor standards (class_id = NULL = global)
-- ELA K-8: Reading Literature, Reading Informational, Writing, Language
-- Math K-8: Operations, Numbers, Fractions, Geometry, Measurement

-- ============================================================
-- ELA — Reading Literature
-- ============================================================
insert into public.standards (class_id, code, description, subject, grade_band, domain, sort_key) values
  (null, 'RL.K.1', 'With prompting and support, ask and answer questions about key details in a text', 'ELA', 'K-2', 'Reading Literature', 'ELA-RL-01'),
  (null, 'RL.K.2', 'With prompting and support, retell familiar stories including key details', 'ELA', 'K-2', 'Reading Literature', 'ELA-RL-02'),
  (null, 'RL.K.3', 'With prompting and support, identify characters, settings, and major events in a story', 'ELA', 'K-2', 'Reading Literature', 'ELA-RL-03'),
  (null, 'RL.1.1', 'Ask and answer questions about key details in a text', 'ELA', 'K-2', 'Reading Literature', 'ELA-RL-04'),
  (null, 'RL.1.2', 'Retell stories including key details and demonstrate understanding of their central message or lesson', 'ELA', 'K-2', 'Reading Literature', 'ELA-RL-05'),
  (null, 'RL.2.1', 'Ask and answer such questions as who, what, where, when, why, and how about key details', 'ELA', 'K-2', 'Reading Literature', 'ELA-RL-06'),
  (null, 'RL.2.2', 'Recount stories and determine their central message, lesson, or moral', 'ELA', 'K-2', 'Reading Literature', 'ELA-RL-07'),
  (null, 'RL.3.1', 'Ask and answer questions to demonstrate understanding, referring explicitly to the text', 'ELA', '3-5', 'Reading Literature', 'ELA-RL-08'),
  (null, 'RL.3.2', 'Recount stories including fables, folktales, and myths; determine the central message, lesson, or moral', 'ELA', '3-5', 'Reading Literature', 'ELA-RL-09'),
  (null, 'RL.3.3', 'Describe characters in a story and explain how their actions contribute to the sequence of events', 'ELA', '3-5', 'Reading Literature', 'ELA-RL-10'),
  (null, 'RL.4.1', 'Refer to details and examples in a text when explaining what the text says explicitly and when drawing inferences', 'ELA', '3-5', 'Reading Literature', 'ELA-RL-11'),
  (null, 'RL.4.2', 'Determine a theme of a story, drama, or poem from details in the text; summarize the text', 'ELA', '3-5', 'Reading Literature', 'ELA-RL-12'),
  (null, 'RL.5.1', 'Quote accurately from a text when explaining what the text says explicitly and when drawing inferences', 'ELA', '3-5', 'Reading Literature', 'ELA-RL-13'),
  (null, 'RL.5.2', 'Determine a theme of a story, drama, or poem from details in the text, including how characters respond to challenges', 'ELA', '3-5', 'Reading Literature', 'ELA-RL-14'),
  (null, 'RL.6.1', 'Cite textual evidence to support analysis of what the text says explicitly as well as inferences drawn', 'ELA', '6-8', 'Reading Literature', 'ELA-RL-15'),
  (null, 'RL.6.2', 'Determine a theme or central idea of a text and how it is conveyed through particular details', 'ELA', '6-8', 'Reading Literature', 'ELA-RL-16'),
  (null, 'RL.7.1', 'Cite several pieces of textual evidence to support analysis of what the text says explicitly and implicitly', 'ELA', '6-8', 'Reading Literature', 'ELA-RL-17'),
  (null, 'RL.7.2', 'Determine a theme or central idea of a text and analyze its development over the course of the text', 'ELA', '6-8', 'Reading Literature', 'ELA-RL-18'),
  (null, 'RL.8.1', 'Cite the textual evidence that most strongly supports an analysis of what the text says explicitly and implicitly', 'ELA', '6-8', 'Reading Literature', 'ELA-RL-19'),
  (null, 'RL.8.2', 'Determine a theme or central idea of a text and analyze its development, including its relationship to characters, setting, and plot', 'ELA', '6-8', 'Reading Literature', 'ELA-RL-20');

-- ============================================================
-- ELA — Reading Informational
-- ============================================================
insert into public.standards (class_id, code, description, subject, grade_band, domain, sort_key) values
  (null, 'RI.K.1', 'With prompting and support, ask and answer questions about key details in a text', 'ELA', 'K-2', 'Reading Informational', 'ELA-RI-01'),
  (null, 'RI.K.2', 'With prompting and support, identify the main topic and retell key details of a text', 'ELA', 'K-2', 'Reading Informational', 'ELA-RI-02'),
  (null, 'RI.1.1', 'Ask and answer questions about key details in a text', 'ELA', 'K-2', 'Reading Informational', 'ELA-RI-03'),
  (null, 'RI.1.2', 'Identify the main topic and retell key details of a text', 'ELA', 'K-2', 'Reading Informational', 'ELA-RI-04'),
  (null, 'RI.2.1', 'Ask and answer such questions as who, what, where, when, why, and how about key details', 'ELA', 'K-2', 'Reading Informational', 'ELA-RI-05'),
  (null, 'RI.2.2', 'Identify the main topic of a multiparagraph text as well as the focus of specific paragraphs', 'ELA', 'K-2', 'Reading Informational', 'ELA-RI-06'),
  (null, 'RI.3.1', 'Ask and answer questions to demonstrate understanding, referring explicitly to the text', 'ELA', '3-5', 'Reading Informational', 'ELA-RI-07'),
  (null, 'RI.3.2', 'Determine the main idea of a text; recount the key details and explain how they support the main idea', 'ELA', '3-5', 'Reading Informational', 'ELA-RI-08'),
  (null, 'RI.4.1', 'Refer to details and examples in a text when explaining what the text says explicitly and when drawing inferences', 'ELA', '3-5', 'Reading Informational', 'ELA-RI-09'),
  (null, 'RI.4.2', 'Determine the main idea of a text and explain how it is supported by key details; summarize the text', 'ELA', '3-5', 'Reading Informational', 'ELA-RI-10'),
  (null, 'RI.5.1', 'Quote accurately from a text when explaining what the text says explicitly and when drawing inferences', 'ELA', '3-5', 'Reading Informational', 'ELA-RI-11'),
  (null, 'RI.5.2', 'Determine two or more main ideas of a text and explain how they are supported by key details; summarize the text', 'ELA', '3-5', 'Reading Informational', 'ELA-RI-12'),
  (null, 'RI.6.1', 'Cite textual evidence to support analysis of what the text says explicitly as well as inferences drawn', 'ELA', '6-8', 'Reading Informational', 'ELA-RI-13'),
  (null, 'RI.6.2', 'Determine a central idea of a text and how it is conveyed through particular details; provide a summary', 'ELA', '6-8', 'Reading Informational', 'ELA-RI-14'),
  (null, 'RI.7.1', 'Cite several pieces of textual evidence to support analysis of what the text says explicitly and implicitly', 'ELA', '6-8', 'Reading Informational', 'ELA-RI-15'),
  (null, 'RI.7.2', 'Determine two or more central ideas in a text and analyze their development over the course of the text', 'ELA', '6-8', 'Reading Informational', 'ELA-RI-16');

-- ============================================================
-- ELA — Writing
-- ============================================================
insert into public.standards (class_id, code, description, subject, grade_band, domain, sort_key) values
  (null, 'W.K.1', 'Use a combination of drawing, dictating, and writing to compose opinion pieces', 'ELA', 'K-2', 'Writing', 'ELA-W-01'),
  (null, 'W.K.2', 'Use a combination of drawing, dictating, and writing to compose informative/explanatory texts', 'ELA', 'K-2', 'Writing', 'ELA-W-02'),
  (null, 'W.K.3', 'Use a combination of drawing, dictating, and writing to narrate a single event or several loosely linked events', 'ELA', 'K-2', 'Writing', 'ELA-W-03'),
  (null, 'W.1.1', 'Write opinion pieces in which they introduce the topic, state an opinion, and supply a reason for the opinion', 'ELA', 'K-2', 'Writing', 'ELA-W-04'),
  (null, 'W.2.1', 'Write opinion pieces in which they introduce the topic, state an opinion, and supply reasons that support the opinion', 'ELA', 'K-2', 'Writing', 'ELA-W-05'),
  (null, 'W.3.1', 'Write opinion pieces on topics or texts, supporting a point of view with reasons', 'ELA', '3-5', 'Writing', 'ELA-W-06'),
  (null, 'W.3.2', 'Write informative/explanatory texts to examine a topic and convey ideas and information clearly', 'ELA', '3-5', 'Writing', 'ELA-W-07'),
  (null, 'W.3.3', 'Write narratives to develop real or imagined experiences or events using effective technique and descriptive details', 'ELA', '3-5', 'Writing', 'ELA-W-08'),
  (null, 'W.4.1', 'Write opinion pieces on topics or texts, supporting a point of view with reasons and information', 'ELA', '3-5', 'Writing', 'ELA-W-09'),
  (null, 'W.5.1', 'Write opinion pieces on topics or texts, supporting a point of view with reasons and information', 'ELA', '3-5', 'Writing', 'ELA-W-10'),
  (null, 'W.5.2', 'Write informative/explanatory texts to examine a topic and convey ideas and information clearly', 'ELA', '3-5', 'Writing', 'ELA-W-11'),
  (null, 'W.6.1', 'Write arguments to support claims with clear reasons and relevant evidence', 'ELA', '6-8', 'Writing', 'ELA-W-12'),
  (null, 'W.6.2', 'Write informative/explanatory texts to examine a topic and convey ideas, concepts, and information', 'ELA', '6-8', 'Writing', 'ELA-W-13'),
  (null, 'W.7.1', 'Write arguments to support claims with clear reasons and relevant evidence', 'ELA', '6-8', 'Writing', 'ELA-W-14'),
  (null, 'W.8.1', 'Write arguments to support claims with clear reasons and relevant evidence, acknowledging alternate claims', 'ELA', '6-8', 'Writing', 'ELA-W-15');

-- ============================================================
-- ELA — Language
-- ============================================================
insert into public.standards (class_id, code, description, subject, grade_band, domain, sort_key) values
  (null, 'L.K.1', 'Demonstrate command of the conventions of standard English grammar and usage when writing or speaking', 'ELA', 'K-2', 'Language', 'ELA-L-01'),
  (null, 'L.K.2', 'Demonstrate command of the conventions of standard English capitalization, punctuation, and spelling', 'ELA', 'K-2', 'Language', 'ELA-L-02'),
  (null, 'L.1.1', 'Demonstrate command of the conventions of standard English grammar and usage when writing or speaking', 'ELA', 'K-2', 'Language', 'ELA-L-03'),
  (null, 'L.1.2', 'Demonstrate command of the conventions of standard English capitalization, punctuation, and spelling', 'ELA', 'K-2', 'Language', 'ELA-L-04'),
  (null, 'L.2.1', 'Demonstrate command of the conventions of standard English grammar and usage when writing or speaking', 'ELA', 'K-2', 'Language', 'ELA-L-05'),
  (null, 'L.3.1', 'Demonstrate command of the conventions of standard English grammar and usage when writing or speaking', 'ELA', '3-5', 'Language', 'ELA-L-06'),
  (null, 'L.3.3', 'Use knowledge of language and its conventions when writing, speaking, reading, or listening', 'ELA', '3-5', 'Language', 'ELA-L-07'),
  (null, 'L.4.1', 'Demonstrate command of the conventions of standard English grammar and usage when writing or speaking', 'ELA', '3-5', 'Language', 'ELA-L-08'),
  (null, 'L.4.4', 'Determine or clarify the meaning of unknown and multiple-meaning words and phrases', 'ELA', '3-5', 'Language', 'ELA-L-09'),
  (null, 'L.5.1', 'Demonstrate command of the conventions of standard English grammar and usage when writing or speaking', 'ELA', '3-5', 'Language', 'ELA-L-10'),
  (null, 'L.6.1', 'Demonstrate command of the conventions of standard English grammar and usage when writing or speaking', 'ELA', '6-8', 'Language', 'ELA-L-11'),
  (null, 'L.6.4', 'Determine or clarify the meaning of unknown and multiple-meaning words and phrases', 'ELA', '6-8', 'Language', 'ELA-L-12'),
  (null, 'L.7.1', 'Demonstrate command of the conventions of standard English grammar and usage when writing or speaking', 'ELA', '6-8', 'Language', 'ELA-L-13'),
  (null, 'L.8.1', 'Demonstrate command of the conventions of standard English grammar and usage when writing or speaking', 'ELA', '6-8', 'Language', 'ELA-L-14');

-- ============================================================
-- Math — Operations & Algebraic Thinking
-- ============================================================
insert into public.standards (class_id, code, description, subject, grade_band, domain, sort_key) values
  (null, 'OA.K.1', 'Represent addition and subtraction with objects, fingers, mental images, drawings, sounds, acting out, verbal explanations, expressions, or equations', 'Math', 'K-2', 'Operations', 'MATH-OA-01'),
  (null, 'OA.K.2', 'Solve addition and subtraction word problems and add and subtract within 10', 'Math', 'K-2', 'Operations', 'MATH-OA-02'),
  (null, 'OA.1.1', 'Use addition and subtraction within 20 to solve word problems', 'Math', 'K-2', 'Operations', 'MATH-OA-03'),
  (null, 'OA.1.3', 'Apply properties of operations as strategies to add and subtract', 'Math', 'K-2', 'Operations', 'MATH-OA-04'),
  (null, 'OA.2.1', 'Use addition and subtraction within 100 to solve one- and two-step word problems', 'Math', 'K-2', 'Operations', 'MATH-OA-05'),
  (null, 'OA.2.2', 'Fluently add and subtract within 20 using mental strategies', 'Math', 'K-2', 'Operations', 'MATH-OA-06'),
  (null, 'OA.3.1', 'Interpret products of whole numbers as the total number of objects in equal groups', 'Math', '3-5', 'Operations', 'MATH-OA-07'),
  (null, 'OA.3.2', 'Interpret whole-number quotients of whole numbers as the number of objects in each share', 'Math', '3-5', 'Operations', 'MATH-OA-08'),
  (null, 'OA.3.3', 'Use multiplication and division within 100 to solve word problems', 'Math', '3-5', 'Operations', 'MATH-OA-09'),
  (null, 'OA.4.1', 'Interpret a multiplication equation as a comparison and represent verbal statements of multiplicative comparisons', 'Math', '3-5', 'Operations', 'MATH-OA-10'),
  (null, 'OA.4.2', 'Multiply or divide to solve word problems involving multiplicative comparison', 'Math', '3-5', 'Operations', 'MATH-OA-11'),
  (null, 'OA.5.1', 'Use parentheses, brackets, or braces in numerical expressions and evaluate expressions with these symbols', 'Math', '3-5', 'Operations', 'MATH-OA-12'),
  (null, 'OA.5.2', 'Write simple expressions that record calculations with numbers and interpret numerical expressions without evaluating them', 'Math', '3-5', 'Operations', 'MATH-OA-13');

-- ============================================================
-- Math — Numbers & Base Ten
-- ============================================================
insert into public.standards (class_id, code, description, subject, grade_band, domain, sort_key) values
  (null, 'NBT.K.1', 'Compose and decompose numbers from 11 to 19 into ten ones and some further ones', 'Math', 'K-2', 'Numbers', 'MATH-NBT-01'),
  (null, 'NBT.1.1', 'Count to 120 starting at any number less than 120; read and write numerals and represent a number of objects', 'Math', 'K-2', 'Numbers', 'MATH-NBT-02'),
  (null, 'NBT.1.2', 'Understand that the two digits of a two-digit number represent amounts of tens and ones', 'Math', 'K-2', 'Numbers', 'MATH-NBT-03'),
  (null, 'NBT.2.1', 'Understand that the three digits of a three-digit number represent amounts of hundreds, tens, and ones', 'Math', 'K-2', 'Numbers', 'MATH-NBT-04'),
  (null, 'NBT.2.3', 'Read and write numbers to 1000 using base-ten numerals, number names, and expanded form', 'Math', 'K-2', 'Numbers', 'MATH-NBT-05'),
  (null, 'NBT.3.1', 'Use place value understanding to round whole numbers to the nearest 10 or 100', 'Math', '3-5', 'Numbers', 'MATH-NBT-06'),
  (null, 'NBT.3.2', 'Fluently add and subtract within 1000 using strategies and algorithms based on place value', 'Math', '3-5', 'Numbers', 'MATH-NBT-07'),
  (null, 'NBT.4.1', 'Recognize that in a multi-digit whole number a digit in one place represents ten times what it represents in the place to its right', 'Math', '3-5', 'Numbers', 'MATH-NBT-08'),
  (null, 'NBT.4.2', 'Read and write multi-digit whole numbers using base-ten numerals, number names, and expanded form', 'Math', '3-5', 'Numbers', 'MATH-NBT-09'),
  (null, 'NBT.5.1', 'Recognize that in a multi-digit number a digit in one place represents 10 times as much as it represents in the place to its right and 1/10 of what it represents in the place to its left', 'Math', '3-5', 'Numbers', 'MATH-NBT-10'),
  (null, 'NBT.5.2', 'Explain patterns in the number of zeros of the product when multiplying a number by powers of 10', 'Math', '3-5', 'Numbers', 'MATH-NBT-11');

-- ============================================================
-- Math — Fractions (Number & Operations — Fractions)
-- ============================================================
insert into public.standards (class_id, code, description, subject, grade_band, domain, sort_key) values
  (null, 'NF.3.1', 'Understand a fraction 1/b as the quantity formed by 1 part when a whole is partitioned into b equal parts', 'Math', '3-5', 'Fractions', 'MATH-NF-01'),
  (null, 'NF.3.2', 'Understand a fraction as a number on the number line; represent fractions on a number line diagram', 'Math', '3-5', 'Fractions', 'MATH-NF-02'),
  (null, 'NF.3.3', 'Explain equivalence of fractions and compare fractions by reasoning about their size', 'Math', '3-5', 'Fractions', 'MATH-NF-03'),
  (null, 'NF.4.1', 'Explain why a fraction a/b is equivalent to a fraction (n×a)/(n×b) by using visual fraction models', 'Math', '3-5', 'Fractions', 'MATH-NF-04'),
  (null, 'NF.4.2', 'Compare two fractions with different numerators and different denominators', 'Math', '3-5', 'Fractions', 'MATH-NF-05'),
  (null, 'NF.4.3', 'Understand a fraction a/b with a > 1 as a sum of fractions 1/b', 'Math', '3-5', 'Fractions', 'MATH-NF-06'),
  (null, 'NF.4.4', 'Apply and extend previous understandings of multiplication to multiply a fraction by a whole number', 'Math', '3-5', 'Fractions', 'MATH-NF-07'),
  (null, 'NF.5.1', 'Add and subtract fractions with unlike denominators including mixed numbers', 'Math', '3-5', 'Fractions', 'MATH-NF-08'),
  (null, 'NF.5.2', 'Solve word problems involving addition and subtraction of fractions', 'Math', '3-5', 'Fractions', 'MATH-NF-09'),
  (null, 'NF.5.3', 'Interpret a fraction as division of the numerator by the denominator', 'Math', '3-5', 'Fractions', 'MATH-NF-10'),
  (null, 'NS.6.1', 'Interpret and compute quotients of fractions and solve word problems involving division of fractions', 'Math', '6-8', 'Fractions', 'MATH-NF-11'),
  (null, 'NS.6.2', 'Fluently divide multi-digit numbers using the standard algorithm', 'Math', '6-8', 'Fractions', 'MATH-NF-12'),
  (null, 'NS.6.3', 'Fluently add, subtract, multiply, and divide multi-digit decimals using the standard algorithm', 'Math', '6-8', 'Fractions', 'MATH-NF-13'),
  (null, 'NS.7.1', 'Apply and extend previous understandings of addition and subtraction to add and subtract rational numbers', 'Math', '6-8', 'Fractions', 'MATH-NF-14'),
  (null, 'NS.7.2', 'Apply and extend previous understandings of multiplication and division to multiply and divide rational numbers', 'Math', '6-8', 'Fractions', 'MATH-NF-15');

-- ============================================================
-- Math — Geometry
-- ============================================================
insert into public.standards (class_id, code, description, subject, grade_band, domain, sort_key) values
  (null, 'G.K.1', 'Describe objects in the environment using names of shapes and describe their relative positions', 'Math', 'K-2', 'Geometry', 'MATH-G-01'),
  (null, 'G.K.2', 'Correctly name shapes regardless of their orientations or overall size', 'Math', 'K-2', 'Geometry', 'MATH-G-02'),
  (null, 'G.1.1', 'Distinguish between defining attributes versus non-defining attributes; build and draw shapes', 'Math', 'K-2', 'Geometry', 'MATH-G-03'),
  (null, 'G.1.2', 'Compose two-dimensional and three-dimensional shapes to create a composite shape', 'Math', 'K-2', 'Geometry', 'MATH-G-04'),
  (null, 'G.2.1', 'Recognize and draw shapes having specified attributes such as a given number of angles or faces', 'Math', 'K-2', 'Geometry', 'MATH-G-05'),
  (null, 'G.3.1', 'Understand that shapes in different categories may share attributes and that shared attributes can define a larger category', 'Math', '3-5', 'Geometry', 'MATH-G-06'),
  (null, 'G.3.2', 'Partition shapes into parts with equal areas; express the area of each part as a unit fraction', 'Math', '3-5', 'Geometry', 'MATH-G-07'),
  (null, 'G.4.1', 'Draw and identify lines and angles, and classify shapes by properties of their lines and angles', 'Math', '3-5', 'Geometry', 'MATH-G-08'),
  (null, 'G.4.2', 'Classify two-dimensional figures based on the presence or absence of parallel or perpendicular lines', 'Math', '3-5', 'Geometry', 'MATH-G-09'),
  (null, 'G.5.1', 'Use a pair of perpendicular number lines (axes) to define a coordinate system', 'Math', '3-5', 'Geometry', 'MATH-G-10'),
  (null, 'G.5.2', 'Classify two-dimensional figures in a hierarchy based on properties', 'Math', '3-5', 'Geometry', 'MATH-G-11'),
  (null, 'G.6.1', 'Find the area of right triangles, other triangles, special quadrilaterals, and polygons', 'Math', '6-8', 'Geometry', 'MATH-G-12'),
  (null, 'G.6.2', 'Find the volume of a right rectangular prism with fractional edge lengths', 'Math', '6-8', 'Geometry', 'MATH-G-13'),
  (null, 'G.7.1', 'Solve problems involving scale drawings of geometric figures', 'Math', '6-8', 'Geometry', 'MATH-G-14'),
  (null, 'G.7.2', 'Draw, construct, and describe geometrical figures and describe the relationships between them', 'Math', '6-8', 'Geometry', 'MATH-G-15'),
  (null, 'G.8.1', 'Verify experimentally the properties of rotations, reflections, and translations', 'Math', '6-8', 'Geometry', 'MATH-G-16'),
  (null, 'G.8.2', 'Understand congruence and similarity using physical models, transparencies, or geometry software', 'Math', '6-8', 'Geometry', 'MATH-G-17');

-- ============================================================
-- Math — Measurement & Data
-- ============================================================
insert into public.standards (class_id, code, description, subject, grade_band, domain, sort_key) values
  (null, 'MD.K.1', 'Describe measurable attributes of objects, such as length or weight', 'Math', 'K-2', 'Measurement', 'MATH-MD-01'),
  (null, 'MD.K.2', 'Directly compare two objects with a measurable attribute in common to see which object has more of or less of the attribute', 'Math', 'K-2', 'Measurement', 'MATH-MD-02'),
  (null, 'MD.1.1', 'Order three objects by length; compare the lengths of two objects indirectly by using a third object', 'Math', 'K-2', 'Measurement', 'MATH-MD-03'),
  (null, 'MD.1.2', 'Express the length of an object as a whole number of length units', 'Math', 'K-2', 'Measurement', 'MATH-MD-04'),
  (null, 'MD.2.1', 'Measure the length of an object by selecting and using appropriate tools', 'Math', 'K-2', 'Measurement', 'MATH-MD-05'),
  (null, 'MD.2.2', 'Measure the length of an object twice using length units of different lengths', 'Math', 'K-2', 'Measurement', 'MATH-MD-06'),
  (null, 'MD.3.1', 'Tell and write time to the nearest minute and measure time intervals in minutes', 'Math', '3-5', 'Measurement', 'MATH-MD-07'),
  (null, 'MD.3.2', 'Measure and estimate liquid volumes and masses of objects using standard units', 'Math', '3-5', 'Measurement', 'MATH-MD-08'),
  (null, 'MD.3.3', 'Draw a scaled picture graph and a scaled bar graph to represent a data set', 'Math', '3-5', 'Measurement', 'MATH-MD-09'),
  (null, 'MD.4.1', 'Know relative sizes of measurement units within one system of units', 'Math', '3-5', 'Measurement', 'MATH-MD-10'),
  (null, 'MD.4.2', 'Use the four operations to solve word problems involving distances, intervals of time, and money', 'Math', '3-5', 'Measurement', 'MATH-MD-11'),
  (null, 'MD.4.3', 'Apply the area and perimeter formulas for rectangles in real world and mathematical problems', 'Math', '3-5', 'Measurement', 'MATH-MD-12'),
  (null, 'MD.5.1', 'Convert among different-sized standard measurement units within a given measurement system', 'Math', '3-5', 'Measurement', 'MATH-MD-13'),
  (null, 'MD.5.2', 'Make a line plot to display a data set of measurements in fractions of a unit', 'Math', '3-5', 'Measurement', 'MATH-MD-14');
