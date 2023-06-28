import { ConflictException, ExecutionContext, Injectable, InternalServerErrorException, NotFoundException, UnauthorizedException } from '@nestjs/common';
import { CreateCourseDto } from './dto/create-course.dto';
import { UpdateCourseDto } from './dto/update-course.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Course } from './entities/course.entity';
import { User } from '../user/entities/user.entity';
import { UserService } from '../user/user.service';


@Injectable()
export class CourseService {
  constructor(
    @InjectRepository(Course)
    private readonly courseRepository: Repository<Course>,
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
    private userService: UserService, // Inject the UserService

 ) {}

  async createCourse(
    createCourseDto: CreateCourseDto,
    user: User
  ): Promise<Course> {
    const { title, description, difficulty, topic , content} = createCourseDto;

      // Check if a course with the same title already exists
  const existingCourse = await this.courseRepository.findOne({ where: { title } });
  if (existingCourse) {
    throw new ConflictException('A course with the same title already exists.');
  }

  // Check if a course with the same description already exists
  const existingCourseWithDescription = await this.courseRepository.findOne({ where: { description } });
  if (existingCourseWithDescription) {
    throw new ConflictException('A course with the same description already exists.');
  }

    const course = new Course();
    course.title = title;
    course.description = description;
    course.difficulty = difficulty;
    course.topic = topic;
    course.content = content;
    course.creator = user; // Assign the current user as the creator of the course
 
    // Update the user's wallet
    //await this.userService.updateUserWallet(user.id, 200);

    return this.courseRepository.save(course);
  }
  

  //Todo los cursos pero sin contenido (publico)
  async findAll(): Promise<Course[]> {
    try {
      const courses = await this.courseRepository.find({
      order: { rating: 'DESC' },
      select: ['title','topic', 'price', 'rating']
      });
      return courses;
    } catch (error) {
      throw new Error('Error while fetching the courses.');
    }
  }


  // Curso sin contenido (publico)
  async findOne(courseId: number): Promise<Course> {
    //try {
      const course = await this.courseRepository.findOne({ where: { courseId }, select: ['title','topic', 'price', 'rating', 'description', 'stars', 'comments'] });
      
      if (!course) {
        throw new NotFoundException(`Course ${courseId} not found.`);
      }
      return course;
   // } catch (error) {
   //   throw new Error('Error while fetching the course.');
   // }
  }





  async update(courseId: number, updateCourseDto: UpdateCourseDto, id: number): Promise<Course> {
    const course = await this.courseRepository.findOne( {  where: { courseId}, relations: ['creator']} );
    if (!course) {
      throw new NotFoundException('Course not found.');
    }
    console.log(course.creator.id)
    if (course.creator.id !== id) {
      
      throw new UnauthorizedException('You are not authorized to update this course.');
    }
      // Perform the update on the course entity
      course.title = updateCourseDto.title;
      course.description = updateCourseDto.description;
      course.difficulty = updateCourseDto.difficulty
      course.topic = updateCourseDto.topic 
      course.content = updateCourseDto.content
    
      const updatedCourse = await this.courseRepository.save(course);

    return updatedCourse;
  }


  async removeCourse(courseId: number): Promise<boolean> {

    const course = await this.courseRepository.findOne({ where: { courseId } });

    if (!course) {
      throw new NotFoundException(`Course with ID '${courseId}' not found`);
    } const result = await this.courseRepository.delete(courseId);

    if (result.affected === 0) {
      throw new InternalServerErrorException('Failed to delete course');
    }

    return true;
  }

//!! WARNING arreglar wallet!
  async updateApproval(courseId: number, approval: boolean): Promise<Course> {
    const course = await this.courseRepository.findOne({ where: { courseId } });
    
    if (!course) {
      throw new NotFoundException('Course not found.');
    }

    course.approved = approval;
    const updatedCourse = await this.courseRepository.save(course);

    //Llama a la función updateUserWallet del UserService
    await this.userService.updateUserWallet(course.creator.id, 100); 

    return updatedCourse;
  }
}