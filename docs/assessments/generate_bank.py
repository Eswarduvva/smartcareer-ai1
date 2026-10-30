import json
rows=[]
def add(skill,topic,difficulty,i,prompt,answer,distractors,explanation):
 options=list(dict.fromkeys([str(answer)]+[str(x) for x in distractors]))
 # Disambiguate colliding numeric distractors for particular parameter values.
 for alternative in ['Not enough information','None of these values','A runtime error']:
  if len(options)<4 and alternative not in options: options.append(alternative)
 if len(options)!=4: raise ValueError((skill,topic,i,options))
 position=i%4; options.insert(position,options.pop(0))
 rows.append(dict(bank_key=f'{skill}-{topic.lower().replace(" ","-")}-{i}',skill=skill,topic=topic,difficulty=difficulty,prompt=prompt,options=options,correct_option=position,explanation=explanation,review_status='checked'))
for skill in ['python','sql','java','javascript','cpp','data-analysis']:
 for i in range(6):
  n=i+3; b=i+2
  def q(topic,level,p,a,d,e): add(skill,topic,level,i,p,a,d,e)
  if skill=='python':
   q('Arithmetic','beginner',f'Python 3: What is {n} // 2?',n//2,[n,n/2+0.25,n+2],'// is floor division; divide by 2 and round down.')
   q('Lists','beginner',f'Python 3: What does [{n}, {n+1}, {n+2}][-1] return?',n+2,[n,n+1,'IndexError'],'A negative index of -1 selects the last element.')
   q('Strings','beginner',f'Python 3: What is len("{"a"*n}")?',n,[n-1,n+1,'TypeError'],'len counts the characters in this ASCII string.')
   q('Boolean logic','beginner',f'Python 3: What is ({n} > {b}) and ({b} > 0)?','True',['False','None','SyntaxError'],'Both comparisons are true, so their conjunction is true.')
   q('Ranges','intermediate',f'Python 3: What is sum(range({n}))?',n*(n-1)//2,[n*n,n*(n+1)//2,-n],'range(n) contains integers from 0 through n-1; their sum is n(n-1)/2.')
   q('Comprehensions','intermediate',f'Python 3: What is [x * 2 for x in range(1, {n})][-1]?',2*(n-1),[2*n,n-1,n+1],'The final range value is n-1, which is multiplied by 2.')
   q('Dictionaries','intermediate',f'Python 3: What does {{"a": {n}}}.get("b", {b}) return?',b,[n,'None','KeyError'],'dict.get returns its default argument when the key is missing.')
   q('Slicing','intermediate',f'Python 3: What is len(list(range({n}))[::2])?',(n+1)//2,[n,0,n+1],'A step of 2 selects indexes 0, 2, 4, and so on.')
   q('Mutable defaults','advanced',f'Python 3: def f(x, a=[]): a.append(x); return len(a). After f({n}) is called once, what does f({b}) return?','2',['1','0','TypeError'],'The default list is created once and shared across calls, so it contains two items.')
   q('Generators','advanced',f'Python 3: g = (x for x in range({n})); next(g); next(g). What is sum(g)?',n*(n-1)//2-1,[n*(n-1)//2,n*n,-1],'The first two values 0 and 1 have been consumed; only the remaining values are summed.')
  elif skill=='sql':
   q('Filtering','beginner',f'PostgreSQL: a table has values 1 through {n} in column x. How many rows satisfy WHERE x > {b}?',n-b,[n,b,0],'Only integers strictly above the threshold are selected.')
   q('Ordering','beginner',f'PostgreSQL: column x contains {n}, {n+1}, {n+2}. What is the first value from ORDER BY x DESC?',n+2,[n,n+1,'NULL'],'DESC sorts these nonnull numeric values largest first.')
   q('Counting','beginner',f'PostgreSQL: column x contains {n}, NULL, {b}. What is COUNT(x)?','2',['3','1','0'],'COUNT(column) counts nonnull values; COUNT(*) would count all three rows.')
   q('Distinct values','beginner',f'PostgreSQL: column x contains {n}, {n}, {b}. What is COUNT(DISTINCT x)?','2',['3','1',str(n+1)],'DISTINCT removes the repeated value before counting.')
   q('Aggregation','intermediate',f'PostgreSQL: column x contains {n}, {n+2}, NULL. What is AVG(x)?',n+1,[n,n+2,(2*n+2)/3],'AVG ignores NULL and divides the sum of two nonnull values by 2.')
   q('Joins','intermediate',f'PostgreSQL: table A has {n} rows and B has {b} rows. How many rows does A CROSS JOIN B produce?',n*b,[n+b,n,b],'A cross join produces one row for every pair of input rows.')
   q('Null handling','intermediate',f'PostgreSQL: What is COALESCE(NULL, {n}, {b})?',n,[b,'NULL',n+b],'COALESCE returns its first nonnull argument.')
   q('Group filtering','intermediate',f'PostgreSQL: Which clause keeps only grouped departments with COUNT(*) > {n}?','HAVING COUNT(*) > '+str(n),['WHERE COUNT(*) > '+str(n),'ORDER BY COUNT(*) > '+str(n),'LIMIT '+str(n)],'HAVING filters aggregated groups; WHERE filters input rows before grouping.')
   q('Window functions','advanced',f'PostgreSQL: salaries are {n}, {n}, {n+1}. What are DENSE_RANK() values in salary ASC order?','1, 1, 2',['1, 2, 3','1, 1, 3','0, 0, 1'],'DENSE_RANK assigns equal ranks to ties and leaves no gap before the next distinct value.')
   q('Three valued logic','advanced',f'PostgreSQL: What does SELECT {n} WHERE {n} NOT IN ({b}, NULL) return?','No rows',['One row with '+str(n),'One row with NULL','A syntax error'],'A NULL comparison makes NOT IN unknown rather than true, so WHERE does not retain the row.')
  elif skill=='java':
   q('Integer division','beginner',f'Java 17: What is the value of int x = {n} / 2;?',n//2,[n,n/2+0.25,'Compilation error'],'Division between ints truncates toward zero.')
   q('Arrays','beginner',f'Java 17: int[] a = new int[{n}]; What is a.length?',n,[n-1,n+1,'Compilation error'],'An array created with length n has exactly n elements.')
   q('String length','beginner',f'Java 17: What does "{"x"*n}".length() return?',n,[n-1,n+1,'null'],'These ASCII characters occupy one UTF-16 code unit each.')
   q('Remainder','beginner',f'Java 17: What is {n} % 2?',n%2,[2,n,-1],'The remainder is 0 for even positive integers and 1 for odd positive integers.')
   q('Loops','intermediate',f'Java 17: int s=0; for(int x=0; x<{n}; x++) s+=x; What is s?',n*(n-1)//2,[n*n,n*(n+1)//2,-1],'The loop sums integers from 0 through n-1.')
   q('List removal','intermediate',f'Java 17: var a = new java.util.ArrayList<Integer>(java.util.List.of({n}, {b})); a.remove(0); What is a.get(0)?',b,[n,'null','IndexOutOfBoundsException'],'remove(int) removes by index; the second element then moves to index 0.')
   q('String equality','intermediate',f'Java 17: String a = new String("v{n}"); String b = new String("v{n}"); Which comparison is true?','a.equals(b)',['a == b','a != b && !a.equals(b)','Both a == b and !a.equals(b)'],'equals compares String contents, while == compares these distinct object references.')
   q('Pass by value','intermediate',f'Java 17: int x={n}; a method receives x as int p and sets p={b}. What is x after returning?',n,[b,'null','Compilation error'],'Java passes the value of a primitive argument; changing the parameter does not change the caller variable.')
   q('Stream reduction','advanced',f'Java 17: What is java.util.stream.IntStream.range(0, {n}).reduce(0, Integer::sum)?',n*(n-1)//2,[n*n,n*(n+1)//2,-n],'range excludes the upper bound; reduce adds all included integers to the identity 0.')
   q('Finally control flow','advanced',f'Java 17: int f() {{ try {{ return {n}; }} finally {{ return {b}; }} }} What does f() return?',b,[n,'Compilation error','An exception'],'A return in finally replaces the pending return from try; this is legal but generally discouraged.')
  elif skill=='javascript':
   q('Array length','beginner',f'JavaScript ES2022: What is [{n}, {b}, 0].length?','3',['2','0',str(n+2)],'This array literal contains three elements.')
   q('Strict equality','beginner',f'JavaScript ES2022: What is {n} === "{n}"?','false',['true','undefined','TypeError'],'Strict equality does not convert between number and string types.')
   q('Remainder','beginner',f'JavaScript ES2022: What is {n} % 2?',n%2,[2,n,-1],'Positive integer remainder modulo 2 is 0 or 1.')
   q('String length','beginner',f'JavaScript ES2022: What is "{"a"*n}".length?',n,[n-1,n+1,'undefined'],'Each ASCII character contributes one code unit to the length.')
   q('Array mapping','intermediate',f'JavaScript ES2022: What is [{n}, {b}].map(x => x * 2)[0]?',2*n,[n,2*b,n+b],'map doubles each element, so the first result is twice the first input.')
   q('Array reduction','intermediate',f'JavaScript ES2022: What is [{n}, {b}].reduce((a,x) => a+x, 0)?',n+b,[n*b,n,b],'reduce adds both elements to the initial accumulator 0.')
   q('Nullish coalescing','intermediate',f'JavaScript ES2022: What is 0 ?? {n}?','0',[str(n),'null','undefined'],'The nullish operator uses its right side only for null or undefined, not for 0.')
   q('Destructuring','intermediate',f'JavaScript ES2022: const [a, ...rest] = [{n}, {b}, 0]; What is rest.length?','2',['3','1','0'],'The first item is assigned to a and the remaining two items form rest.')
   q('Closure state','advanced',f'JavaScript ES2022: let x={n}; const f=()=>++x; f(); What does f() return on the second call?',n+2,[n,n+1,'ReferenceError'],'The closure shares x; each call increments the same variable before returning it.')
   q('Event loop','advanced',f'JavaScript ES2022: console.log({n}); Promise.resolve().then(()=>console.log({b})); console.log(0); In what order are values logged?',f'{n}, 0, {b}',[f'{n}, {b}, 0',f'{b}, {n}, 0',f'0, {n}, {b}'],'Synchronous logs run first; the promise microtask runs after the current stack completes.')
  elif skill=='cpp':
   q('Integer division','beginner',f'C++17: What is int x = {n} / 2;?',n//2,[n,n/2+0.25,'Compilation error'],'Integer division truncates toward zero.')
   q('Vector size','beginner',f'C++17: std::vector<int> v({n}); What is v.size()?',n,[0,n-1,n+1],'The single size constructor creates n default-initialized elements.')
   q('Remainder','beginner',f'C++17: What is {n} % 2?',n%2,[2,n,-1],'The remainder of a positive integer divided by 2 is 0 or 1.')
   q('String size','beginner',f'C++17: What is std::string("{"a"*n}").size()?',n,[n-1,n+1,'Compilation error'],'The string contains n one-byte ASCII characters.')
   q('References','intermediate',f'C++17: int x={n}; int& r=x; r={b}; What is x?',b,[n,'Undefined behavior','Compilation error'],'A reference aliases the original variable; assignment through it changes x.')
   q('Value parameters','intermediate',f'C++17: void f(int p) {{ p={b}; }} int x={n}; f(x); What is x?',n,[b,'Undefined behavior','Compilation error'],'A value parameter is a copy, so assigning p does not change x.')
   q('Accumulation','intermediate',f'C++17: std::vector<int> v{{{n}, {b}, 0}}; What is std::accumulate(v.begin(),v.end(),0)?',n+b,[n*b,n,b],'The default accumulate operation adds each element to the integer initial value 0.')
   q('Const access','intermediate',f'C++17: const int x={n}; Which statement is valid?','int y = x;',['x = '+str(b)+';','++x;','int& r = x;'],'A const int can be copied, but cannot be assigned to or bound to a nonconst int reference.')
   q('Move ownership','advanced',f'C++17: auto a=std::make_unique<int>({n}); auto b=std::move(a); Which statement is guaranteed?','a is null and *b is '+str(n),['Both a and b own the same int','*a remains '+str(n),'The move copies the int into a new allocation'],'Moving a unique_ptr transfers ownership and leaves the source pointer empty.')
   q('Lambda capture','advanced',f'C++17: int x={n}; auto f=[x]() mutable {{ return ++x; }}; f(); f(); What is the original x?',n,[n+1,n+2,'Undefined behavior'],'The lambda captures x by value; mutable allows changing only its internal copy.')
  else:
   q('Mean','beginner',f'What is the arithmetic mean of {n}, {n+2}, and {n+4}?',n+2,[n,n+4,3*n+6],'Add the three values and divide by 3.')
   q('Median','beginner',f'What is the median of {n+4}, {n}, and {n+2}?',n+2,[n,n+4,3*n+6],'Sort the three values and select the middle one.')
   q('Range','beginner',f'What is the range of the dataset [{n}, {n+2}, {n+5}]?','5',['2',str(n+5),'0'],'Range is maximum minus minimum, here (n+5)-n=5.')
   q('Missing values','beginner',f'A dataset contains {n} observed values and {b} missing values. Which action is most defensible before imputation?','Investigate the missingness mechanism',['Always replace missing values with zero','Delete every column with a missing value','Treat missing as evidence of poor performance'],'Missingness can be systematic; understand its cause before choosing an imputation policy.')
   q('Percentage change','intermediate',f'A metric rises from {n*10} to {n*12}. What is the percentage increase?','20%',['12%','2%','120%'],'The change is 2n relative to the original 10n, giving 20%.')
   q('Weighted mean','intermediate',f'Values {n} and {n+4} have weights 3 and 1. What is their weighted mean?',n+1,[n+2,n+3,4*n+4],'Compute (3n + n+4)/4 = n+1.')
   q('Join duplication','intermediate',f'A customer table has {n} customers, each with exactly {b} orders. How many rows are in the inner join on customer ID?',n*b,[n,n+b,b],'Each customer matches b orders, producing n times b rows.')
   q('Data leakage','intermediate',f'A model uses {n} features and a training/test split. When should a scaler be fitted?','On training data only',['On all rows before splitting','On test data only','On target labels only'],'Fitting preprocessing on test observations leaks information about the held-out distribution.')
   q('Population variance','advanced',f'For the population [{n-1}, {n}, {n+1}], what is the population variance?','2/3',['1','2','1/3'],'The mean is n. Squared deviations sum to 2; divide by the population size 3.')
   q('Simpson paradox','advanced',f'A comparison across {n} regions favors product A within each region but favors B overall. What should you investigate?','Unequal region sizes and confounding',['Assume the overall arithmetic is necessarily wrong','Discard region-level results','Conclude A caused every observed outcome'],'Different group weights can reverse aggregated associations; compare like groups and investigate confounders.')
assert len(rows)==360
from collections import Counter
for s in {r['skill'] for r in rows}:
 assert Counter(r['difficulty'] for r in rows if r['skill']==s)=={'beginner':24,'intermediate':24,'advanced':12}
open('docs/assessments/question-bank.json','w').write(json.dumps(rows,indent=2)+'\n')
