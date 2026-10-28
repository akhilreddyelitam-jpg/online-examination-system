package com.onlineexam.config;

import com.onlineexam.entity.*;
import com.onlineexam.repository.ExamRepository;
import com.onlineexam.repository.QuestionRepository;
import com.onlineexam.repository.RoleRepository;
import com.onlineexam.repository.UserRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.CommandLineRunner;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

import java.util.Arrays;

@Component
public class DataInitializer implements CommandLineRunner {

    private static final Logger logger = LoggerFactory.getLogger(DataInitializer.class);

    @Autowired
    private RoleRepository roleRepository;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private ExamRepository examRepository;

    @Autowired
    private QuestionRepository questionRepository;

    @Autowired
    private PasswordEncoder passwordEncoder;

    @Override
    @Transactional
    public void run(String... args) {
        // 1. Initialize Roles
        Role adminRole = initRole(ERole.ROLE_ADMIN);
        Role teacherRole = initRole(ERole.ROLE_TEACHER);
        Role studentRole = initRole(ERole.ROLE_STUDENT);

        // 2. Initialize Seed Users
        User admin = initUser("System Administrator", "admin@exam.com", "admin123", adminRole);
        User teacher = initUser("Prof. Alan Turing", "teacher@exam.com", "teacher123", teacherRole);
        User student = initUser("John Doe", "student@exam.com", "student123", studentRole);

        // 3. Initialize Sample Exam if none exists
        if (examRepository.count() == 0) {
            initSampleExam(teacher);
        }

        logger.info("Database initialization completed successfully.");
    }

    private Role initRole(ERole roleName) {
        return roleRepository.findByName(roleName)
                .orElseGet(() -> roleRepository.save(new Role(roleName)));
    }

    private User initUser(String name, String email, String password, Role role) {
        return userRepository.findByEmail(email).orElseGet(() -> {
            User user = new User(name, email, passwordEncoder.encode(password), role);
            return userRepository.save(user);
        });
    }

    private void initSampleExam(User teacher) {
        Exam exam = new Exam();
        exam.setTitle("Full-Stack Web Development & Java Certification Exam");
        exam.setSubject("Computer Science & Engineering");
        exam.setDescription("Comprehensive certification test covering Object-Oriented Programming, Spring Boot REST architecture, React component state, and database transactions.");
        exam.setDurationMinutes(20);
        exam.setTotalMarks(25.0);
        exam.setPassingPercentage(60.0);
        exam.setPublished(true);
        exam.setNegativeMarkingEnabled(true);
        exam.setDefaultNegativeMarks(0.5);
        exam.setCreatedBy(teacher);

        Exam savedExam = examRepository.save(exam);

        // Question 1: MCQ
        Question q1 = new Question();
        q1.setExam(savedExam);
        q1.setQuestionText("Which annotation in Spring Boot is used to mark a class as a RESTful web controller returning JSON responses directly?");
        q1.setQuestionType(QuestionType.MCQ);
        q1.setMarks(5.0);
        q1.setNegativeMarks(0.5);
        q1.setExplanation("@RestController combines @Controller and @ResponseBody, serializing return values directly into HTTP response bodies as JSON.");
        q1.setOptions(Arrays.asList(
                new Option("@RestController", true),
                new Option("@ControllerComponent", false),
                new Option("@WebEndpoint", false),
                new Option("@RestDispatcher", false)
        ));
        questionRepository.save(q1);

        // Question 2: MCQ
        Question q2 = new Question();
        q2.setExam(savedExam);
        q2.setQuestionText("In React.js, which built-in hook is primarily used for executing side-effects such as data fetching, subscriptions, or manual DOM manipulations?");
        q2.setQuestionType(QuestionType.MCQ);
        q2.setMarks(5.0);
        q2.setNegativeMarks(0.5);
        q2.setExplanation("The useEffect hook lets you perform side effects in functional React components after renders.");
        q2.setOptions(Arrays.asList(
                new Option("useEffect", true),
                new Option("useState", false),
                new Option("useContext", false),
                new Option("useReducer", false)
        ));
        questionRepository.save(q2);

        // Question 3: MCQ
        Question q3 = new Question();
        q3.setExam(savedExam);
        q3.setQuestionText("What is the primary responsibility of the Java Virtual Machine (JVM) ClassLoader subsystem?");
        q3.setQuestionType(QuestionType.MCQ);
        q3.setMarks(5.0);
        q3.setNegativeMarks(0.5);
        q3.setExplanation("The JVM ClassLoader dynamically loads compiled .class bytecode files into runtime memory and links them.");
        q3.setOptions(Arrays.asList(
                new Option("Loading compiled bytecode (.class) files into memory", true),
                new Option("Compiling Java source code into bytecode", false),
                new Option("Executing garbage collection sweeps", false),
                new Option("Managing network socket connections", false)
        ));
        questionRepository.save(q3);

        // Question 4: True/False
        Question q4 = new Question();
        q4.setExam(savedExam);
        q4.setQuestionText("In Spring Security with stateless REST architectures, JSON Web Tokens (JWT) require server-side session persistence in HTTP sessions.");
        q4.setQuestionType(QuestionType.TRUE_FALSE);
        q4.setMarks(5.0);
        q4.setNegativeMarks(0.5);
        q4.setExplanation("False. JWTs are stateless and self-contained; the backend validates their cryptographic signature without server-side session storage.");
        q4.setOptions(Arrays.asList(
                new Option("False", true),
                new Option("True", false)
        ));
        questionRepository.save(q4);

        // Question 5: MCQ
        Question q5 = new Question();
        q5.setExam(savedExam);
        q5.setQuestionText("In SQL, which clause is specifically used to filter aggregate records produced by a GROUP BY clause?");
        q5.setQuestionType(QuestionType.MCQ);
        q5.setMarks(5.0);
        q5.setNegativeMarks(0.5);
        q5.setExplanation("The HAVING clause applies filtering conditions to grouped records, whereas WHERE filters individual rows before grouping.");
        q5.setOptions(Arrays.asList(
                new Option("HAVING", true),
                new Option("WHERE", false),
                new Option("ORDER BY", false),
                new Option("LIMIT", false)
        ));
        questionRepository.save(q5);

        logger.info("Sample certification exam and questions seeded.");
    }
}
